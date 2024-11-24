import { Observable } from '@nativescript/core';
import { prompt } from '@nativescript/core';
import { getStore } from '../../store';

export function onShownModally(args) {
    const page = args.object;
    const context = args.context;
    const store = getStore();
    const viewModel = new Observable();
    
    viewModel.providers = store.providers;
    viewModel.filteredProviders = [...viewModel.providers];
    viewModel.searchText = "";
    
    viewModel.onSearchTextChanged = (args) => {
        const searchValue = args.object.text.toLowerCase();
        viewModel.filteredProviders = viewModel.providers.filter(provider => 
            provider.name.toLowerCase().includes(searchValue)
        );
        viewModel.notifyPropertyChange('filteredProviders', viewModel.filteredProviders);
    };
    
    viewModel.onProviderTap = (args) => {
        const selectedProvider = viewModel.filteredProviders[args.index];
        if (selectedProvider) {
            context.onSelect(selectedProvider);
            page.closeModal();
        }
    };
    
    viewModel.onAddNew = () => {
        prompt({
            title: "Add Provider",
            message: "Enter provider name",
            okButtonText: "Add",
            cancelButtonText: "Cancel",
            inputType: "text",
            cancelable: true
        }).then((result) => {
            if (result.result && result.text) {
                const newProvider = { name: result.text };
                store.addProvider(newProvider);
                context.onSelect(newProvider);
                page.closeModal();
            }
        });
    };
    
    viewModel.onClose = () => {
        page.closeModal();
    };
    
    page.bindingContext = viewModel;
}