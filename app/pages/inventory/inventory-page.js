import { Observable } from '@nativescript/core';
import { getStore } from '../../store';

export function onNavigatingTo(args) {
    const page = args.object;
    const store = getStore();
    const viewModel = new Observable();
    
    viewModel.inventory = store.inventory;
    
    viewModel.onAddProduct = () => {
        const options = {
            title: "Add Product",
            message: "Enter product name",
            okButtonText: "Add",
            cancelButtonText: "Cancel",
            inputType: "text"
        };
        
        prompt(options).then((result) => {
            if (result.result && result.text) {
                store.addProduct({ name: result.text });
            }
        });
    };
    
    page.bindingContext = viewModel;
}