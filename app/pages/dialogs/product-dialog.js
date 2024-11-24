import { Observable } from '@nativescript/core';
import { alert } from '@nativescript/core';
import { getStore } from '../../store';

export function onShownModally(args) {
    const page = args.object;
    const context = args.context;
    const store = getStore();
    const viewModel = new Observable();
    
    // Initialize properties
    viewModel.selectedProduct = "";
    viewModel.quantity = "";
    viewModel.price = "";
    viewModel.total = "0.00";
    
    // Show product selection dialog
    viewModel.showProductList = () => {
        const modalPage = "pages/dialogs/selection-dialog";
        page.showModal(modalPage, {
            fullscreen: true,
            animated: true,
            context: {
                items: store.products.map(p => p.name),
                title: "Select Product",
                showAdd: true,
                addTitle: "Add New Product",
                closeCallback: (selected) => {
                    if (selected) {
                        viewModel.set("selectedProduct", selected);
                    }
                }
            }
        });
    };
    
    // Update total when quantity or price changes
    const updateTotal = () => {
        const qty = parseFloat(viewModel.quantity) || 0;
        const prc = parseFloat(viewModel.price) || 0;
        viewModel.set("total", (qty * prc).toFixed(2));
    };
    
    // Watch for changes in quantity and price
    viewModel.on(Observable.propertyChangeEvent, (data) => {
        if (data.propertyName === "quantity" || data.propertyName === "price") {
            updateTotal();
        }
    });
    
    // Handle save button tap
    viewModel.onSave = () => {
        if (!viewModel.selectedProduct) {
            alert({
                title: "Missing Product",
                message: "Please select a product",
                okButtonText: "OK"
            });
            return;
        }
        
        const quantity = parseFloat(viewModel.quantity);
        if (isNaN(quantity) || quantity <= 0) {
            alert({
                title: "Invalid Quantity",
                message: "Please enter a valid quantity",
                okButtonText: "OK"
            });
            return;
        }
        
        const price = parseFloat(viewModel.price);
        if (isNaN(price) || price <= 0) {
            alert({
                title: "Invalid Price",
                message: "Please enter a valid price",
                okButtonText: "OK"
            });
            return;
        }
        
        // Call the onSave callback with the product data
        if (context.onSave) {
            context.onSave({
                name: viewModel.selectedProduct,
                quantity: quantity,
                price: price,
                total: parseFloat(viewModel.total)
            });
        }
        
        page.closeModal();
    };
    
    // Handle close button tap
    viewModel.onClose = () => {
        page.closeModal();
    };
    
    page.bindingContext = viewModel;
}