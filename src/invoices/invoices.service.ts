import { Injectable } from '@nestjs/common';
import { callHTTPException } from 'src/shared/exceptions';
import { Model, Document, isValidObjectId } from 'mongoose';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Invoices } from './invoices.entity';
import { User } from 'src/auth/auth.entity';
import { CreateInvoiceDto, getInvoiceListDto, getInvoiceByIdDto } from './dto';
import { uploadToS3 } from 'src/shared/aws/s3';
import { Connection } from 'mongoose';
import { transactionCommit, transactionRollback } from '../shared/middlewares/transactions.middleware';
import { EnumIncoTerms } from 'src/shared/enums';
import { InvoicesDocumentType } from './invoices.entity';
import axios from 'axios';
import puppeteer from 'puppeteer';
import { roundUptoDecimalPlaces } from 'src/shared/utils/genericFunctions';


@Injectable()
export class InvoicesService {
  constructor(
      @InjectModel(Invoices.name) private readonly invoicesModel: Model<InvoicesDocumentType>,
      @InjectModel(User.name) private readonly userModel: Model<User & Document>,
      @InjectConnection() private readonly connection: Connection,  
  ) {}


      async CreateInvoice(userId:string, invoiceData: CreateInvoiceDto, logo: any): Promise<any> {
          const transaction = await this.connection.startSession();
          transaction.startTransaction();

            try {
                  
              let invoiceNumber: string;

              if (invoiceData.invoiceNumber) {
                  
                  const isInvoiceExist = await this.invoicesModel.findOne(
                    { user_id: userId, invoiceNumber: `INV-${invoiceData.invoiceNumber}` },
                    null,
                    { session: transaction }
                  );


                  if (isInvoiceExist) {
                    callHTTPException("invoice_unique_invoiceNo");
                  }

                  invoiceNumber = `INV-${invoiceData.invoiceNumber}`;
              }
              else {
                  const user = await this.userModel.findOneAndUpdate(
                    { _id: userId },
                    { $inc: { invoiceCounter: 1 } },
                    { new: true, session: transaction }
                  );

                  invoiceNumber = `INV-${user.invoiceCounter}`;
              }

              let logoUrl: string;
              if(logo){
                     logoUrl = await uploadToS3(logo);
              }


              let items = invoiceData.items;

              let subTotal = 0;
              let totalVat = 0;
              let totalDiscount = 0;
              let totalTaxableAmount = 0;
              let totalNonTaxableAmount = 0;
              let invoiceNetTotal;

              items = items.map((item) => {
                  const quantity = Number(item.quantity) || 0;
                  const unitRate = Number(item.unitRate) || 0;
                  const vatPercent = Number(item.taxRate) || 0;   
                  const discountVal = Number(item.discount) || 0;
                  const discountType = item.discountType;       

                  const price = roundUptoDecimalPlaces(unitRate * quantity);

                  let vatAmount = 0;
                  let total = 0;
                  let discountAmount = 0;
                  let taxableAmount = 0;

 
                if (discountType === 'percentage') {
                    const discountPercent = discountVal;
                    vatAmount = roundUptoDecimalPlaces( price * (1 - discountPercent / 100) * (vatPercent / 100) );
                    total = roundUptoDecimalPlaces( price * (1 - discountPercent / 100) * (1 + vatPercent / 100) );
                    discountAmount = roundUptoDecimalPlaces(price * (discountPercent / 100));
                    taxableAmount = roundUptoDecimalPlaces(total / (1 + vatPercent / 100));
                }
                else {
                    discountAmount = roundUptoDecimalPlaces(quantity * discountVal);
                    vatAmount = roundUptoDecimalPlaces((price - discountAmount) * (vatPercent / 100));
                    total = roundUptoDecimalPlaces( (price - discountAmount) * (1 + vatPercent / 100) ); 
                    taxableAmount = roundUptoDecimalPlaces(price - discountAmount);
                }


                subTotal = roundUptoDecimalPlaces(subTotal + price);
                totalVat = roundUptoDecimalPlaces(totalVat + vatAmount);
                totalDiscount = roundUptoDecimalPlaces(totalDiscount + discountAmount);

                 if (vatPercent > 0) {
                    totalTaxableAmount = roundUptoDecimalPlaces(totalTaxableAmount + taxableAmount);
                } 
                else {
                    totalNonTaxableAmount = roundUptoDecimalPlaces(totalNonTaxableAmount + taxableAmount);
                }
          

                invoiceNetTotal = roundUptoDecimalPlaces(totalTaxableAmount + totalNonTaxableAmount + totalVat);

                  return {
                    ...item,
                    vatAmount,
                    total,
                    taxableAmount,
                    discountAmount
                  };
            });


             const newInvoice = new this.invoicesModel(
                    {
                      user_id: userId,
                      invoiceNumber,
                      incoterms: invoiceData.incoterms as EnumIncoTerms, 
                      location: invoiceData.location,
                      invoiceDate: invoiceData.invoiceDate,
                      dueDate: invoiceData.dueDate,
                      supplyDate: invoiceData.supplyDate,
                      supplyEndDate: invoiceData.supplyEndDate,
                      contractId: invoiceData.contractId,
                      customerPoNumber: invoiceData.customerPoNumber,
                      paymentTerms: invoiceData.paymentTerms,
                      paymentMeans: invoiceData.paymentMeans,
                      specialTaxTreatment: invoiceData.specialTaxTreatment,
                      prePaymentInvoice: invoiceData.prePaymentInvoice,
                      business_detail: invoiceData.businessDetailId,
                      customer: invoiceData.customerId,
                      bank_detail: invoiceData.bankDetailId,
                      items: items,
                      logo: logoUrl ?? null,
                      totalAmountInWords: invoiceData.totalAmountInWords,
                      notes: invoiceData.notes,
                      AmountPaidToDate: invoiceData.AmountPaidToDate,
                      subTotal,
                      totalDiscount,
                      totalTaxableAmount,
                      totalNonTaxableAmount,
                      totalVat,
                      invoiceNetTotal
                    }
              );

              await newInvoice.save({ session: transaction });

              let Invoice = await this.invoicesModel
                    .findOne({ _id: newInvoice._id })
                    .select('-user_id -updatedAt')
                     .populate({
                          path: 'business_detail',
                          model: 'BusinessDetails',
                          select: '-isDeleted -createdAt -updatedAt' 
                    })
                    .populate({
                          path: 'customer',
                          model: 'Customers',
                          select: '-isDeleted -createdAt -updatedAt',
                    })
                    .populate({
                          path: 'bank_detail',
                          model: 'BankDetails',
                          select: '-isDeleted -createdAt -updatedAt',
                    }) 
                    .session(transaction)
                    .exec();
              

              await transactionCommit(transaction);

              return { invoice: Invoice };
            } 
            catch (error) {
              await transactionRollback(transaction);
              callHTTPException(error.message);
            }
          
      }


      
                
      async getInvoicesList( invoiceData: getInvoiceListDto, user: any ): Promise<any> {
          try {      
                     
                let sortOrder: 1 | -1 = invoiceData['orderBy'] === 'asc' ? 1 : -1;
                let sortBy = invoiceData['sortBy'] || 'createdAt';  
                let searchBy = invoiceData['searchBy'];
                let search = invoiceData['search'];
                const Invoice_Search_Fields = ['invoiceNumber', 'customerPoNumber'];
                const Customer_Search_Fields = ['name', 'companyName', 'customerNumber'];

                 
                const whereClause: any = {   
                      isDeleted: false,
                      user_id: user['id'],
                  };

  
                  if (invoiceData.invoiceStartDate && invoiceData.invoiceEndDate) {
                      const startDateUTC = new Date(invoiceData.invoiceStartDate);
                      startDateUTC.setUTCHours(0, 0, 0, 0);

                      const endDateUTC = new Date(invoiceData.invoiceEndDate);
                      endDateUTC.setUTCHours(23, 59, 59, 999);

                      whereClause.invoiceDate = { $gte: startDateUTC, $lte: endDateUTC };
                      whereClause.dueDate = { $gte: startDateUTC, $lte: endDateUTC };
                    }


                  if (Invoice_Search_Fields.includes(searchBy) && search) {
                      whereClause[searchBy] = { $regex: search, $options: 'i' };
                  }


                  if (Customer_Search_Fields.includes(searchBy) && search) {
                        const customerCollection = this.connection.collection('customers');
                        const customerMatchQuery: any = { [searchBy]: { $regex: search, $options: 'i' }, isDeleted: false, user_id: user['id'] };
                        const matchedCustomers = await customerCollection.find(customerMatchQuery).project({ _id: 1 }).toArray();
                        const customerIds = matchedCustomers.map(c => c._id);

                        if (customerIds.length === 0) {
                          return { invoice: [], recordsCount: 0 };
                        }

                        const customerIdsAsStrings = customerIds.map(id => id.toString());
                        whereClause.customer = { $in: [...customerIds, ...customerIdsAsStrings] };
                  }

                  const recordsCount = await this.invoicesModel.countDocuments(whereClause);

                  const invoices = await this.invoicesModel
                      .find(whereClause)
                      .select('-isDeleted -user_id -updatedAt')
                      .sort({ [sortBy]: sortOrder } as any)
                      .skip(invoiceData.offSet || 0)
                      .limit(invoiceData.limit || 10)
                      .populate({
                        path: 'business_detail',
                        model: 'BusinessDetails',
                        select: '-isDeleted -createdAt -updatedAt',
                      })
                      .populate({
                        path: 'customer',
                        model: 'Customers',
                        select: '-isDeleted -createdAt -updatedAt',
                      })
                      .populate({
                        path: 'bank_detail',
                        model: 'BankDetails',
                        select: '-isDeleted -createdAt -updatedAt',
                      })
                      .exec();

                    return {
                      invoice: invoices,
                      recordsCount: recordsCount || 0,
                    };
              
              } 
              catch (error) {
                  callHTTPException(error);
              }
      }
      

      
          
        async getInvoiceById(invoiceData: getInvoiceByIdDto): Promise<any> {
            try { 
                            
                if (!isValidObjectId(invoiceData.id)) {
                      callHTTPException('invalid_invoice_id');
                }

                
                const invoice = await this.invoicesModel
                    .findOne({ _id: invoiceData.id, isDeleted: false })
                    .select('-user_id -updatedAt')
                     .populate({
                          path: 'business_detail',
                          model: 'BusinessDetails',
                          select: '-isDeleted -createdAt -updatedAt' 
                    })
                    .populate({
                          path: 'customer',
                          model: 'Customers',
                          select: '-isDeleted -createdAt -updatedAt',
                    })
                    .populate({
                          path: 'bank_detail',
                          model: 'BankDetails',
                          select: '-isDeleted -createdAt -updatedAt',
                    });
              
                        
                          
                if (!invoice) {
                    callHTTPException('invoice_not_exist');  
                }

                return {invoice: invoice }; 
            }
            catch (error) {
                callHTTPException(error.message);
            }            
        }
              
    

        
      
 async downloadInvoice(
        invoiceData: { id: string },
      ): Promise<{ buffer: Buffer; fileName: string }> {
        try {
          if (!isValidObjectId(invoiceData.id)) {
            callHTTPException('invalid_invoice_id');
          }

          const invoice = await this.invoicesModel
            .findOne({ _id: invoiceData.id, isDeleted: false })
            .select('-user_id -updatedAt')
            .populate({
              path: 'business_detail',
              model: 'BusinessDetails',
              select: '-isDeleted -createdAt -updatedAt',
            })
            .populate({
              path: 'customer',
              model: 'Customers',
              select: '-isDeleted -createdAt -updatedAt',
            })
            .populate({
              path: 'bank_detail',
              model: 'BankDetails',
              select: '-isDeleted -createdAt -updatedAt',
            });

          if (!invoice) {
            callHTTPException('invoice_not_exist');
          }

          const puppeteerResult = await this.generateInvoicePdf(invoice); // your current function

          // Convert Uint8Array → Buffer (very cheap operation)
          const nodeBuffer = Buffer.from(puppeteerResult.buffer);

          const fileName = `${invoice.invoiceNumber || 'invoice'}.pdf`;

          return {
            buffer: nodeBuffer,
            fileName,
          };
                } catch (error) {
                  callHTTPException(error.message || error);
                }
          }





          async  generateInvoicePdf(invoice) {
              const browser = await puppeteer.launch({
                headless: true,
                args: [
                  '--no-sandbox',
                  '--disable-setuid-sandbox',
                  '--disable-dev-shm-usage',
                  '--disable-gpu',
                ],
              });


              const page = await browser.newPage();
              const html = await this.generateInvoiceHtml(invoice);
              await page.setContent(html, { waitUntil: 'domcontentloaded' });
              
              const buffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: { top: 0, right: 0, bottom: 0, left: 0 },
              });

              await browser.close();
              const fileName = `${invoice.invoiceNumber}.pdf`;
              return { buffer, fileName };
          }

          async generateInvoiceHtml(invoice) {
                const business = invoice.business_detail || {};
                const customer = invoice.customer || {};
                const bank = invoice.bank_detail || {};
                const items = invoice.items || [];
                const currencyArabicMap = { SAR: 'ر.س' };
                const currency =  'SAR';
                const currencyArabic = currencyArabicMap[currency] || '';
                const totalAmountDue = invoice.invoiceNetTotal || 0.00;
                const totalAmountInWords = invoice?.totalAmountInWords;

                        // Labels
                        const labels = {
                          'CR': 'رقم السجل التجاري',
                          'Customer No': 'رقم العميل',
                          'VAT No': 'الرقم الضريبي',
                          'Phone': 'الهاتف',
                          'CRN Commercial Registration': 'الرقم الموحد',
                          'Email': 'البريد الإلكتروني',
                          'Invoice No': 'رقم الفاتورة',
                          'Invoice Issue Date': 'تاريخ الإصدار',
                          'Date of Supply': 'تاريخ التسليم',
                          'Supply End Date': 'نهاية التسليم',
                          'Purchase Order No': 'رقم أمر الشراء',
                          'Due Date': 'تاريخ الاستحقاق',
                          'Contract Id': 'رقم العقد',
                          'Incoterms': 'الشروط التجارية',
                          'Invoice Currency': 'عملة الفاتورة',
                          'Tax Currency': 'عملة الضريبة',
                          'Payment Information': 'معلومات الدفع',
                          'Bank Country': 'بلد البنك',
                          'Beneficiary Name': 'اسم المستفيد',
                          'Account No': 'رقم الحساب',
                          'Bank Name': 'اسم البنك',
                          'IBAN': 'آيبان',
                          'SWIFT Code': 'رمز سويفت',
                          'Item/Service Code': 'رمز العنصر/الخدمة',
                          'Quantity': 'الكمية',
                          'Unit of Measure': 'وحدة القياس',
                          'Unit Rate': 'سعر الوحدة',
                          'Discount': 'الخصم',
                          'Taxable Amount (Excluding VAT)': 'المبلغ الخاضع للضريبة (غير شامل الضريبة)',
                          'VAT Amount': 'مبلغ الضريبة',
                          'Sub Total (Including VAT)': 'الإجمالي الفرعي (شامل الضريبة)',
                          'Total (Excluding VAT)': 'الإجمالي (غير شامل الضريبة)',
                          'Total Discount': 'إجمالي الخصم',
                          'Total Taxable Amount': 'إجمالي المبلغ الخاضع للضريبة',
                          'Pre-payment Received': 'الدفع المسبق المستلم',
                          'Total VAT': 'إجمالي الضريبة',
                          'Payable Amount': 'المبلغ المستحق',
                          'Refund Policy': 'سياسة الاسترداد',
                        };

                        // Business address
                        const businessAddressParts = [
                           business.addressStreet,
                          business.addressStreetAdditional,
                          business.buildingNumber,
                          business.district,
                          business.province,
                        ].filter(Boolean).join(', ');
                        
                        
                        const businessCityLine = [
                          business.city,
                          business.postalCode  ? `- ${business.postalCode}` : '',,
                          business.additionalNumber ? `- ${business.additionalNumber}` : '',
                        ].filter(Boolean).join(' ');

                        // Customer address
                        const customerAddressParts = [
                          customer.addressStreet,
                          customer.addressStreetAdditional,
                          customer.buildingNumber,
                          customer.district,
                          customer.province
                        ].filter(Boolean).join(', ');


                        const customerCityLine = [
                          customer.city,
                          customer.postalCode ? `- ${customer.postalCode}` : '',
                          customer.neighborhood ? `- ${customer.neighborhood}` : '',
                        ].filter(Boolean).join(' ');

                        // Date formatting
                        const formatDate = (date) => date ? new Date(date).toISOString().split('T')[0] : '';

                        // Format currency
                        const formatCurrency = (value) => `${currency} ${parseFloat(value || 0).toFixed(2)}`;

                        // Items table rows
                        const itemsRows = items.map(item => `
                          <tr>
                            <td>${item.no || ''} </td>
                           <td>
                            ${item.description || ''} ${item.serviceCode ? `(${item.serviceCode})` : ''}
                          </td>
                            <td>${item.quantity || ''}</td>
                            <td>${item.unit || ''}</td>
                            <td>${formatCurrency(item.unitRate)}</td>
                            <td>
                                ${item.discountAmount}
                                ${item.discount || ''}${item.discountType === 'percentage' ? '%' : ''}
                               
                            </td>
                            <td>${formatCurrency(item.taxableAmount)}</td>
                            <td>${formatCurrency(item.vatAmount)} (${item.taxRate || ''}%)</td>
                            <td>${formatCurrency(item.total)}</td>
                          </tr>
                        `).join('');

                        // Summary values
                        const subTotal = formatCurrency(invoice.subTotal);
                        const totalDiscount = formatCurrency(invoice.totalDiscount);
                        const totalTaxableAmount = formatCurrency(invoice.totalTaxableAmount);
                        const prePaymentReceived = formatCurrency(invoice.prePaymentReceived || 0);
                        const totalVat = formatCurrency(invoice.totalVat);
                        const payableAmount = formatCurrency(invoice.invoiceNetTotal);

                        console.log(invoice.logo);
                        // HTML template

                        let logoSrc = '';
                        if (invoice?.logo) {
                            try {
                              const response = await axios.get(invoice.logo, {
                                responseType: 'arraybuffer',
                                timeout: 8000,
                                headers: {
                                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                                }
                              });

                              const contentType = response.headers['content-type'] || 'image/png';
                              const base64 = Buffer.from(response.data).toString('base64');
                              logoSrc = `data:${contentType};base64,${base64}`;
                        } catch (err) {
                          console.warn('Failed to load logo:', invoice.logo, err.message);
                        }
                      }
                        return `
                          <!DOCTYPE html>
                          <html lang="en">
                          <head>
                            <meta charset="UTF-8">
                            <style>
                              @page { size: A4; margin: 0; }
                              body {
                                margin: 20px;
                                font-family: 'Helvetica', Arial, sans-serif;
                                font-size: 12pt;
                                color: #000;
                                width: 210mm;
                                height: 297mm;
                                box-sizing: border-box;
                                padding: 20px;
                                line-height: 1.4;
                              }
                              .container { display: flex; }
                              .left { flex: 1; padding-right: 20px; }
                              .right { flex: 1; padding-left: 20px; }
                              .header {
                                  display: flex;
                                  align-items: center;
                                  justify-content: space-between;
                                  margin-bottom: 25px;
                                  height: 90px;        
                                }
                                .logo-container {
                                  flex: 0 0 auto;
                                  width: 180px;
                                }
                                .logo {
                                  max-width: 180px;
                                  max-height: 70px;
                                  object-fit: contain;
                                  object-position: left;
                                }
                                .title-container {
                                  flex: 1;
                                  text-align: center;
                                }

                                .title {
                                  font-size: 18pt;
                                  font-weight: bold;
                                }
                              .arabic-title {
                                font-size: 16pt;
                                font-weight: bold;
                                direction: rtl;
                              }

                              .right-spacer {
                                flex: 0 0 180px;       /* keeps balance if you want symmetry */
                              }

                              /* Fallback if logo fails to load */
                              .logo-placeholder {
                                width: 180px;
                                height: 70px;
                                background: #f0f0f0;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                font-size: 18pt;
                                color: #888;
                                border: 1px solid #ddd;
                              }
                              .company-name { font-weight: bold; font-size: 12pt; }
                              .address { margin-bottom: 5px; font-size: 10pt; }
                              .details-table thead,
                              .details-table th {
                                background-color: #001f3f;
                                color: white;
                                padding: 10px;
                                font-weight: bold;
                                text-align: left;
                              }

                              .bank-table {
                                    background-color: #f8f9fa;          /* Light background for the whole payment section */
                                    border: 1px solid #ddd;
                                    border-radius: 4px;
                                    padding: 5px;
                                  }


                                  /* For better RTL support on colored sections */
                                  .section-header .arabic-section,
                                  .billed-to .arabic-section {
                                    float: right;
                                    margin-left: 15px;
                                  }
                                                                .contact-table, .details-table, .bank-table, .summary-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                              .contact-table tr, .details-table tr, .bank-table tr, .summary-table tr { border-bottom: 1px solid #ddd; }
                              .contact-table td, .details-table td, .bank-table td, .summary-table td { padding: 5px 0; }
                              .td-left { text-align: left; white-space: normal; word-wrap: break-word; }
                              .td-right { text-align: right; direction: rtl; white-space: normal; word-wrap: break-word; }
                              .details-table tr, .bank-table tr {
                                padding: 6px 0;                   /* ← space between rows */
                                min-height: 32px;
                              }
                              .billed-to {
                                  font-weight: bold;
                                  font-size: 12pt;
                                  margin: 25px 0 10px 0;
                                  padding: 10px 15px;
                                  background-color: #f8f9fa;          /* Very light gray – subtle highlight */
                                  border-left: 5px solid #001f3f;     /* Accent bar on left for visual pop */
                                  border-radius: 4px;
                              }
                              .arabic { direction: rtl; text-align: right; }
                              .section-header {
                              background-color: #001f3f;          
                              color: white;
                              padding: 12px 15px;
                              font-size: 14pt;
                              font-weight: bold;
                              margin: 30px 0 15px 0;
                              text-align: left;
                              border-radius: 4px 4px 0 0;
                            }
                              .arabic-section { direction: rtl; float: right; }
                              .full-width { width: 100%; margin-top: 20px; }
                              .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                              .items-table th {
                                background-color: #001f3f;          /* or your preferred dark color */
                                color: white;
                                padding: 12px 8px;
                                font-size: 12pt;
                                font-weight: bold;
                                text-align: center;
                                vertical-align: middle;
                              }

                              .items-table th .arabic {
                                display: block;
                                margin-top: 6px;
                                font-size: 10.5pt;
                                direction: rtl;
                                text-align: right;
                              }
                              .items-table td { padding: 10px 8px; border-bottom: 1px solid #ddd; font-size: 11.5pt; }
                              .items-table .arabic-th { direction: rtl; text-align: right; }
                              .total-box { background-color: #001f3f; color: white; padding: 10px; text-align: center; font-size: 18pt; border-radius: 5px; margin-top: 5px; }
                              .total-in-words { font-style: italic; text-align: center; margin-top: 10px; }
                              .refund-table { width: 100%; margin-top: 20px; }
                              .refund-table td { padding: 10px; vertical-align: top; }
                              .refund-left { width: 50%; }
                              .refund-right { width: 50%; direction: rtl; text-align: right; }
                              * { word-wrap: break-word; box-sizing: border-box; }
                            </style>
                          </head>
                          <body>
                          <div class="header">
                            <!-- Logo on the left -->
                            <div class="logo-container">
                            ${logoSrc ? `<img src="${logoSrc}" class="logo" alt="Company Logo">` : ''}
                            </div>

                            <!-- Title in the center -->
                            <div class="title-container">
                              <div class="title">TAX INVOICE</div>
                              <div class="arabic-title">فاتورة ضريبية</div>
                            </div>

                            <!-- Optional: empty div to balance layout if needed -->
                            <div class="right-spacer"></div>
                          </div>

                            <div class="container">
                              <div class="left">
                                <div class="company-name">${business.companyName || ''}</div>
                                <div class="company-name arabic">${business.companyNameLocal || ''}</div>
                                 <div class="company-name">${business.name || ''}</div>
                                <div class="address">${businessAddressParts}</div>
                                <div class="address">${businessCityLine}</div>
                                <div class="address arabic">${business.addressLocal || ''}</div>
                                 <div class="address arabic">${business.country || ''}</div>
                                <table class="contact-table">
                                  ${business.companyRegistrationNumber ? `<tr><td class="td-left">CR: ${business.companyRegistrationNumber}</td><td class="td-right">${labels['CR']}</td></tr>` : ''}
                                  ${business.vatNumber ? `<tr><td class="td-left">VAT No: ${business.vatNumber}</td><td class="td-right">${labels['VAT No']}</td></tr>` : ''}
                                  ${business.phoneNumber ? `<tr><td class="td-left">Phone: ${business.phoneNumber}</td><td class="td-right">${labels['Phone']}</td></tr>` : ''}
                                  ${business.identificationNumber ? `<tr><td class="td-left">(CRN) Commercial Registration: ${business.identificationNumber}</td><td class="td-right">${labels['CRN Commercial Registration']}</td></tr>` : ''}
                                  ${business.email ? `<tr><td class="td-left">Email: ${business.email}</td><td class="td-right">${labels['Email']}</td></tr>` : ''}
                                </table>
                                <div class="billed-to">BILLED TO: <span class="arabic arabic-section">مفوتر له</span></div>
                                <div class="company-name">${customer.companyName || ''}</div>
                                <div class="company-name">${customer.companyNameLocal || ''}</div>
                                   <div class="address">${customer.name}</div>
                                <div class="address">${customerAddressParts}</div>
                                <div class="address">${customerCityLine}</div>
                                <div class="address arabic">${customer.addressLocal || ''}</div>
                                <div class="address">${customer.country || ''}</div>
                                <table class="contact-table">
                                  ${customer.customerNumber ? `<tr><td class="td-left">Customer No: ${customer.customerNumber}</td><td class="td-right">${labels['Customer No']}</td></tr>` : ''}
                                  ${customer.vatNumber ? `<tr><td class="td-left">VAT No: ${customer.vatNumber}</td><td class="td-right">${labels['VAT No']}</td></tr>` : ''}
                                  ${customer.phoneNumber ? `<tr><td class="td-left">Phone: ${customer.phoneNumber}</td><td class="td-right">${labels['Phone']}</td></tr>` : ''}
                                  ${customer.email ? `<tr><td class="td-left">Email: ${customer.email}</td><td class="td-right">${labels['Email']}</td></tr>` : ''}
                                  ${customer.companyRegistrationNumber ? `<tr><td class="td-left">CR No: ${customer.companyRegistrationNumber}</td><td class="td-right">${labels['CR']}</td></tr>` : ''}
                                </table>
                              </div>
                              <div class="right">
                                <div class="title" style="text-align: left; font-size: 12pt;">INVOICE DETAILS <span class="arabic arabic-section">تفاصيل الفاتورة</span></div>
                                <table class="details-table">
                                  <tr><td class="td-left">Invoice No: ${invoice.invoiceNumber}</td><td class="td-right">${labels['Invoice No']}</td></tr>
                                  <tr><td class="td-left">Invoice Issue Date: ${formatDate(invoice.invoiceDate)}</td><td class="td-right">${labels['Invoice Issue Date']}</td></tr>
                                  <tr><td class="td-left">Date of Supply: ${formatDate(invoice.supplyDate)}</td><td class="td-right">${labels['Date of Supply']}</td></tr>
                                  ${invoice.supplyEndDate ? `<tr><td class="td-left">Supply End Date: ${formatDate(invoice.supplyEndDate)}</td><td class="td-right">${labels['Supply End Date']}</td></tr>` : ''}
                                  ${invoice.customerPoNumber ? `<tr><td class="td-left">Purchase Order No: ${invoice.customerPoNumber}</td><td class="td-right">${labels['Purchase Order No']}</td></tr>` : ''}
                                  <tr><td class="td-left">Due Date: ${formatDate(invoice.dueDate)}</td><td class="td-right">${labels['Due Date']}</td></tr>
                                  ${invoice.contractId ? `<tr><td class="td-left">Contract Id: ${invoice.contractId}</td><td class="td-right">${labels['Contract Id']}</td></tr>` : ''}
                                  ${invoice.incoterms ? `<tr><td class="td-left">Incoterms: ${invoice.incoterms} - ${invoice.location}</td><td class="td-right">${labels['Incoterms']}</td></tr>` : ''}
                                </table>
                      
                                <div class="total-box">TOTAL AMOUNT DUE 
                                    <span class="arabic arabic-section">المبلغ الإجمالي المستحق</span>
                                    <div>${currency} ${totalAmountDue.toFixed(2)} ${currencyArabic}</div>
                                </div>
                              </div>
                            </div>

                             <div>
                                <div>${business.companyNameLocal}</div>
                                <div class="arabic"> Invoice No. - ${invoice.invoiceNumber} - 'رقم الفاتورة'</div>
                             </div>

                             
                            <!-- Payment Information -->
                            <div class="full-width">
                              <div class="section-header">PAYMENT INFO <span class="arabic arabic-section">${labels['Payment Information']}</span></div>
                              <table class="bank-table">
                                ${bank.country ? `<tr><td class="td-left">Bank Country: ${bank.country}</td><td class="td-right">${labels['Bank Country']}</td></tr>` : ''}
                                ${bank.beneficiaryName ? `<tr><td class="td-left">Beneficiary Name: ${bank.beneficiaryName}</td><td class="td-right">${labels['Beneficiary Name']}</td></tr>` : ''}
                                ${bank.accountNumber ? `<tr><td class="td-left">Account No: ${bank.accountNumber}</td><td class="td-right">${labels['Account No']}</td></tr>` : ''}
                                ${bank.bankName ? `<tr><td class="td-left">Bank Name: ${bank.bankName}</td><td class="td-right">${labels['Bank Name']}</td></tr>` : ''}
                                ${bank.iban ? `<tr><td class="td-left">IBAN: ${bank.iban}</td><td class="td-right">${labels['IBAN']}</td></tr>` : ''}
                                ${bank.swiftCode ? `<tr><td class="td-left">SWIFT Code: ${bank.swiftCode}</td><td class="td-right">${labels['SWIFT Code']}</td></tr>` : ''}
                              </table>
                            </div>


                             <div>
                                <div>${invoice.specialTaxTreatment}</div>
                                <div> ${invoice.paymentTerms} </div>
                             </div>

                            <!-- Items Table -->
                            <div class="full-width">
                              <div class="section-header">Items <span class="arabic arabic-section">العناصر</span></div>
                            <table class="items-table">
                              <thead>
                                <tr>
                                 <th>
                                    No.<br>
                                    <span class="arabic"> رقم</span>
                                  </th>

                                  <th>
                                    Item/Service Code<br>
                                    <span class="arabic">رمز العنصر/الخدمة</span>
                                  </th>
                                  <th>
                                    Quantity<br>
                                    <span class="arabic">الكمية</span>
                                  </th>
                                  <th>
                                    Unit of Measure<br>
                                    <span class="arabic">وحدة القياس</span>
                                  </th>
                                  <th>
                                    Unit Rate<br>
                                    <span class="arabic">سعر الوحدة</span>
                                  </th>
                                  <th>
                                    Discount<br>
                                    <span class="arabic">الخصم</span>
                                  </th>
                                  <th>
                                    Taxable Amount (Excl. VAT)<br>
                                    <span class="arabic">المبلغ الخاضع للضريبة (غير شامل الضريبة)</span>
                                  </th>
                                  <th>
                                    VAT Amount<br>
                                    <span class="arabic">مبلغ الضريبة</span>
                                  </th>
                                  <th>
                                    Sub Total (Incl. VAT)<br>
                                    <span class="arabic">الإجمالي الفرعي (شامل الضريبة)</span>
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                ${itemsRows}
                              </tbody>
                            </table>
                            </div>

                            <!-- Financial Summary -->
                            <div class="full-width">
                              <div class="section-header">Financial Summary <span class="arabic arabic-section">الملخص المالي</span></div>
                              <table class="summary-table">
                                <tr><td class="td-left">Total (Excluding VAT): ${subTotal}</td><td class="td-right">${labels['Total (Excluding VAT)']}</td></tr>
                                <tr><td class="td-left">Total Discount: ${totalDiscount}</td><td class="td-right">${labels['Total Discount']}</td></tr>
                                <tr><td class="td-left">Total Taxable Amount: ${totalTaxableAmount}</td><td class="td-right">${labels['Total Taxable Amount']}</td></tr>
                                <tr><td class="td-left">Pre-payment Received: ${prePaymentReceived}</td><td class="td-right">${labels['Pre-payment Received']}</td></tr>
                                <tr><td class="td-left">Total VAT: ${totalVat}</td><td class="td-right">${labels['Total VAT']}</td></tr>
                                <tr><td class="td-left">Payable Amount: ${payableAmount}</td><td class="td-right">${labels['Payable Amount']}</td></tr>
                              </table>
                            <div class="total-in-words">${totalAmountInWords ? totalAmountInWords : ''}</div>
                            </div>

                            <!-- Refund Policy -->
                              ${business.refundPolicy || business.refundPolicyLocal ? 
                                  `<div class="full-width">
                                      <div class="section-header">
                                        Refund Policy 
                                        <span class="arabic arabic-section">${labels['Refund Policy']}</span>
                                      </div>
                                      <table class="refund-table">
                                        <tr>
                                          <td class="refund-left">${business.refundPolicy || ''}</td>
                                          <td class="refund-right">${business.refundPolicyLocal || ''}</td>
                                        </tr>
                                      </table>
                                  </div>` 
                                : ''
                              }

                          </body>
                          </html> `;
                }


}



