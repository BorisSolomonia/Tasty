import { Observable } from '@nativescript/core';
import { getStore } from '../../store';

export function onNavigatingTo(args) {
    const page = args.object;
    const store = getStore();
    const viewModel = new Observable();
    
    viewModel.providers = store.providers;
    
    viewModel.onAddTap = () => {
        prompt({
            title: "Add Provider",
            message: "Enter provider name",
            okButtonText: "Add",
            cancelButtonText: "Cancel",
            inputType: "text"
        }).then((result) => {
            if (result.result && result.text) {
                store.addProvider({ name: result.text });
                viewModel.notifyPropertyChange('providers', store.providers);
            }
        });
    };
    
    page.bindingContext = viewModel;
}