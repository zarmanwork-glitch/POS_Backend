
export const ApiKeys = [{
    auth:{
        user_not_exist: "User does not Exist",
        account_blocked: "Your Account is Blocked",
        invalid_email_or_password: "Invalid Email or password",
        login_success: "Login Successful",
    },
    items:{
        add_item_success: "Item Added Successfully",
        update_item_success: "Item Updated Successfully",
        get_items_success: "Items Data Fetched Successfully",
        get_item_by_id_success: "Item Fetched Successfully",
        delete_item_success: "Item Deleted Successfully",
        item_not_exist: "Item Does Not Exist",
        no_record_found: "No Record Found",
        invalid_item_id: "Item with id does not exit"
    },
    bank_details:{
        add_bank_details_success: "Bank Details Added Successfully",
        get_bank_details_success: "Bank Details Fetched Successfully",
        update_bank_details_success: "Bank Details Updated Successfully",
        get_bank_detail_by_id_success: "Bank Detail Fetched Successfully",
        delete_bank_details_success: "Bank Details Deleted Successfully",
        bank_detail_not_exist: "Bank Detail Does Not Exist",
        bank_details_unique_account_number: "A bank detail with the account number already exists",
        bank_details_unique_iban: "A bank detail with the iban already exists",
        no_record_found: "No Record Found",
        invalid_bank_detail_id: "Bank Detail with id does not exit",
        bank_detail_linked_with_invoice: "You cannot delete bank detail as it is already linked with invoice"
    },
    business_details:{
        add_business_details_success: "Business Details Added Successfully",
        update_business_details_success: "Business Details Updated Successfully",
        delete_business_detail_success: "Business Detail Deleted Successfully",
        get_business_details_success: "Business Details Fetched Successfully",
        get_business_detail_by_id_success: "Business Detail Fetched Successfully",
        no_record_found: "No Record Found",
        business_details_unique_company_registration_number: "CR and GST/VAT No. combination is already in use. Please use a different combination.",
        business_details_unique_email: "A profile with the email already exists",
        business_detail_not_exist: "Business detail does not exist",
        invalid_business_detail_id: "Business Detail with id does not exist",
        business_detail_linked_with_invoice: "You cannot delete business detail as it is already linked with invoice"
    },
    customers:{
        add_customer_success: "Customer Added Successfully",
        update_customer_success: "Customer Updated Successfully",
        delete_customer_success: "Customer Deleted Successfully",
        get_customers_success: "Customer Details Fetched Successfully",
        get_customer_by_id_success: "Customer Detail Fetched Successfully",
        no_record_found: "No Record Found",
        customer_unique_email: "A customer with the email already exists",
        customer_not_exist: "Customer does not exist",
        invalid_customer_id: "Customer with id does not exist"
    },
    invoices:{
        create_invoice_success: "Invoice Created Successfully",
        get_invoices_success: "Invoices Fetched Successfully",
        invoice_unique_invoiceNo: "An invoice with the same invoice number already exists",
        invalid_invoice_id: "Invoice with id does not exist",
        invoice_not_exist: "Invoice does not exist",
        get_invoice_by_id_success: "Invoice Fetched Successfully",
        no_record_found: "No Record Found",
        customer_linked_with_invoice: "You cannot delete customer as it is already linked with invoice",
        invoiceNetTotal_greater_than_zero: "invoiceNetTotal must be greater than 0",
    }
}]