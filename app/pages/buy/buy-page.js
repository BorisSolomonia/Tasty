import { Observable, Frame } from '@nativescript/core';
import { getStore } from '../../store';
import { alert } from '@nativescript/core';

export function onNavigatingTo(args) {
    const page = args.object;
    const store = getStore();
    const viewModel = new Observable();
    
    viewModel.companyName = '';
    viewModel.products = [];
    viewModel.totalPurchase = '0.00';
    
    viewModel.onBackTap = () => {
        Frame.topmost().goBack();
    };
    
    viewModel.showProviders = () => {
        const modalPage = "pages/dialogs/provider-dialog";
        page.showModal(modalPage, {
            fullscreen: true,
            animated: true,
            context: {
                providers: store.providers,
                onSelect: (provider) => {
                    viewModel.set("companyName", provider.name);
                }
            }
        });
    };
    
    viewModel.showProductSelection = () => {
        const modalPage = "pages/dialogs/product-dialog";
        page.showModal(modalPage, {
            fullscreen: true,
            animated: true,
            context: {
                products: store.products,
                onSave: (product) => {
                    const newProduct = new Observable({
                        name: product.name,
                        quantity: product.quantity.toString(),
                        price: product.price.toString(),
                        get total() {
                            return (parseFloat(this.quantity) * parseFloat(this.price)).toFixed(2);
                        }
                    });
                    
                    viewModel.products.push(newProduct);
                    viewModel.notifyPropertyChange('products', viewModel.products);
                    updateTotalPurchase();
                }
            }
        });
    };
    
    viewModel.onRemoveProduct = (args) => {
        const index = viewModel.products.indexOf(args.object.bindingContext);
        if (index > -1) {
            viewModel.products.splice(index, 1);
            viewModel.notifyPropertyChange('products', viewModel.products);
            updateTotalPurchase();
        }
    };
    
    const updateTotalPurchase = () => {
        const total = viewModel.products.reduce((sum, product) => {
            return sum + parseFloat(product.total || 0);
        }, 0);
        viewModel.set('totalPurchase', total.toFixed(2));
    };
    
    viewModel.onSavePurchase = () => {
        if (!viewModel.companyName) {
            alert({
                title: "Missing Provider",
                message: "Please select a provider",
                okButtonText: "OK"
            });
            return;
        }
        
        if (viewModel.products.length === 0) {
            alert({
                title: "No Products",
                message: "Please add at least one product",
                okButtonText: "OK"
            });
            return;
        }
        
        store.addPurchase({
            companyName: viewModel.companyName,
            products: viewModel.products.map(p => ({
                name: p.name,
                quantity: parseInt(p.quantity),
                price: parseFloat(p.price),
                total: parseFloat(p.total)
            })),
            total: parseFloat(viewModel.totalPurchase),
            date: new Date().toISOString()
        });
        
        alert({
            title: "Success",
            message: "Purchase saved successfully!",
            okButtonText: "OK"
        }).then(() => {
            Frame.topmost().goBack();
        });
    };
    
    page.bindingContext = viewModel;
}