import { Observable } from '@nativescript/core';
import { getStore } from '../../store';

export function onNavigatingTo(args) {
    const page = args.object;
    const store = getStore();
    const viewModel = new Observable();
    
    viewModel.products = store.products;
    
    viewModel.onAddTap = () => {
        prompt({
            title: "Add Product",
            message: "Enter product name",
            okButtonText: "Add",
            cancelButtonText: "Cancel",
            inputType: "text"
        }).then((result) => {
            if (result.result && result.text) {
                store.addProduct({ name: result.text });
                viewModel.notifyPropertyChange('products', store.products);
            }
        });
    };
    
    page.bindingContext = viewModel;
}