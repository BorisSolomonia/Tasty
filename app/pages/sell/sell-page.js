import { Observable } from '@nativescript/core';
import { getStore } from '../../store';

export function onNavigatingTo(args) {
    const page = args.object;
    const store = getStore();
    const viewModel = new Observable();
    
    viewModel.companyName = '';
    viewModel.products = [];
    
    viewModel.showCustomers = () => {
        page.showModal("pages/dialogs/selection-dialog", {
            closeCallback: (selected) => {
                if (selected) {
                    viewModel.set("companyName", selected);
                }
            },
            context: { 
                items: store.customers.map(c => c.name),
                title: "Select Customer",
                showAdd: true,
                addTitle: "Add New Customer"
            }
        });
    };
    
    viewModel.showProductSelection = () => {
        // Filter out products with zero quantity
        const availableProducts = store.inventory
            .filter(item => item.quantity > 0)
            .map(item => item.name);
            
        if (availableProducts.length === 0) {
            alert("No products available in inventory");
            return;
        }
        
        page.showModal("pages/dialogs/selection-dialog", {
            closeCallback: (selected) => {
                if (selected) {
                    // Check if product already exists in the list
                    const existingProduct = viewModel.products.find(p => p.name === selected);
                    if (!existingProduct) {
                        const inventoryItem = store.inventory.find(item => item.name === selected);
                        const newProduct = {
                            name: selected,
                            available: inventoryItem.quantity,
                            quantity: '',
                            price: '',
                            get total() {
                                const qty = parseFloat(this.quantity) || 0;
                                const prc = parseFloat(this.price) || 0;
                                return (qty * prc).toFixed(2);
                            }
                        };
                        viewModel.products.push(newProduct);
                        viewModel.notifyPropertyChange('products', viewModel.products);
                        updateTotalSale();
                    } else {
                        alert("This product is already in the list");
                    }
                }
            },
            context: { 
                items: availableProducts,
                title: "Select Product from Inventory",
                showAdd: false
            }
        });
    };
    
    viewModel.onRemoveProduct = (args) => {
        const index = viewModel.products.indexOf(args.object.bindingContext);
        viewModel.products.splice(index, 1);
        viewModel.notifyPropertyChange('products', viewModel.products);
        updateTotalSale();
    };
    
    const updateTotalSale = () => {
        const total = viewModel.products.reduce((sum, product) => {
            return sum + parseFloat(product.total || 0);
        }, 0);
        viewModel.set('totalSale', total.toFixed(2));
    };
    
    viewModel.onSaveSale = () => {
        if (!viewModel.companyName) {
            alert("Please select a customer");
            return;
        }
        
        // Validate quantities
        const invalidProducts = viewModel.products.filter(p => {
            const qty = parseInt(p.quantity);
            return !p.quantity || !p.price || qty <= 0 || qty > p.available;
        });
        
        if (invalidProducts.length > 0) {
            alert("Please check quantities and prices. Ensure quantities are within available stock.");
            return;
        }
        
        store.addSale({
            companyName: viewModel.companyName,
            products: viewModel.products.map(p => ({
                name: p.name,
                quantity: parseInt(p.quantity),
                price: parseFloat(p.price),
                total: parseFloat(p.total)
            })),
            total: parseFloat(viewModel.totalSale),
            date: new Date().toISOString()
        });
        
        page.frame.goBack();
    };
    
    // Watch for changes in product quantities and prices
    viewModel.on(Observable.propertyChangeEvent, (propertyChangeData) => {
        if (propertyChangeData.propertyName === "products") {
            updateTotalSale();
        }
    });
    
    page.bindingContext = viewModel;
}