import { Observable } from '@nativescript/core';
import { getStore } from '../../store';

export function onNavigatingTo(args) {
    const page = args.object;
    const store = getStore();
    const viewModel = new Observable();
    
    viewModel.customers = store.customers;
    
    viewModel.onAddTap = () => {
        prompt({
            title: "Add Customer",
            message: "Enter customer name",
            okButtonText: "Add",
            cancelButtonText: "Cancel",
            inputType: "text"
        }).then((result) => {
            if (result.result && result.text) {
                store.addCustomer({ name: result.text });
                viewModel.notifyPropertyChange('customers', store.customers);
            }
        });
    };
    
    page.bindingContext = viewModel;
}