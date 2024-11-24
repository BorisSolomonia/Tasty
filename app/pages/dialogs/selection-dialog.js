import { Observable, Frame } from '@nativescript/core';
import { prompt } from '@nativescript/core';

export function onShownModally(args) {
    const page = args.object;
    const context = args.context;
    const closeCallback = args.closeCallback;
    
    const viewModel = new Observable();
    
    viewModel.items = context.items || [];
    viewModel.filteredItems = [...viewModel.items];
    viewModel.searchText = "";
    viewModel.title = context.title || "Select Item";
    viewModel.showAddButton = context.showAdd || false;
    viewModel.addButtonText = context.addTitle ? `+ ${context.addTitle}` : "+ Add New";
    
    viewModel.onSearchTextChanged = (args) => {
        const searchValue = args.object.text.toLowerCase();
        viewModel.filteredItems = viewModel.items.filter(item => 
            item.toLowerCase().includes(searchValue)
        );
        viewModel.notifyPropertyChange('filteredItems', viewModel.filteredItems);
    };
    
    viewModel.onItemTap = (args) => {
        const selectedItem = viewModel.filteredItems[args.index];
        if (selectedItem) {
            closeCallback(selectedItem);
            page.closeModal();
        }
    };
    
    viewModel.onAddNew = () => {
        prompt({
            title: context.addTitle || "Add New",
            message: "Enter name",
            okButtonText: "Add",
            cancelButtonText: "Cancel",
            inputType: "text",
            cancelable: true
        }).then((result) => {
            if (result.result && result.text) {
                closeCallback(result.text);
                page.closeModal();
            }
        });
    };
    
    viewModel.onClose = () => {
        page.closeModal();
    };
    
    page.bindingContext = viewModel;
}