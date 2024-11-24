import { Observable } from '@nativescript/core';
import { ApplicationSettings } from '@nativescript/core';
import * as XLSX from 'xlsx';
import { knownFolders } from '@nativescript/core';

class Store extends Observable {
    constructor() {
        super();
        this.inventory = [];
        this.customers = [];
        this.providers = [];
        this.products = [];
        this.sales = [];
        this.purchases = [];
        this.loadInitialData();
    }

    loadInitialData() {
        try {
            this.inventory = JSON.parse(ApplicationSettings.getString('inventory', '[]'));
            this.customers = JSON.parse(ApplicationSettings.getString('customers', '[]'));
            this.providers = JSON.parse(ApplicationSettings.getString('providers', '[]'));
            this.products = JSON.parse(ApplicationSettings.getString('products', '[]'));
            this.sales = JSON.parse(ApplicationSettings.getString('sales', '[]'));
            this.purchases = JSON.parse(ApplicationSettings.getString('purchases', '[]'));
        } catch (error) {
            console.error('Error loading data:', error);
            this.inventory = [];
            this.customers = [];
            this.providers = [];
            this.products = [];
            this.sales = [];
            this.purchases = [];
        }
    }

    saveData() {
        ApplicationSettings.setString('inventory', JSON.stringify(this.inventory));
        ApplicationSettings.setString('customers', JSON.stringify(this.customers));
        ApplicationSettings.setString('providers', JSON.stringify(this.providers));
        ApplicationSettings.setString('products', JSON.stringify(this.products));
        ApplicationSettings.setString('sales', JSON.stringify(this.sales));
        ApplicationSettings.setString('purchases', JSON.stringify(this.purchases));
    }

    addProduct(product) {
        if (!this.products.find(p => p.name === product.name)) {
            const newProduct = {
                id: Date.now().toString(),
                ...product,
                createdAt: new Date().toISOString()
            };
            this.products.push(newProduct);
            
            // Add to inventory if not exists
            if (!this.inventory.find(i => i.name === product.name)) {
                this.inventory.push({
                    id: newProduct.id,
                    name: product.name,
                    quantity: 0
                });
            }
            
            this.saveData();
            this.notifyPropertyChange('products', this.products);
            this.notifyPropertyChange('inventory', this.inventory);
        }
    }

    addPurchase(purchase) {
        const newPurchase = {
            id: Date.now().toString(),
            ...purchase,
            date: new Date().toISOString()
        };
        
        this.purchases.push(newPurchase);
        
        // Update inventory
        purchase.products.forEach(product => {
            let inventoryItem = this.inventory.find(item => item.name === product.name);
            if (inventoryItem) {
                inventoryItem.quantity += product.quantity;
            } else {
                this.addProduct({ name: product.name });
                inventoryItem = this.inventory.find(item => item.name === product.name);
                if (inventoryItem) {
                    inventoryItem.quantity = product.quantity;
                }
            }
        });
        
        this.saveData();
        this.notifyPropertyChange('purchases', this.purchases);
        this.notifyPropertyChange('inventory', this.inventory);
    }

    addProvider(provider) {
        if (!this.providers.find(p => p.name === provider.name)) {
            this.providers.push({
                id: Date.now().toString(),
                ...provider,
                createdAt: new Date().toISOString()
            });
            this.saveData();
            this.notifyPropertyChange('providers', this.providers);
        }
    }

    exportToExcel() {
        const workbook = XLSX.utils.book_new();

        // Export Sales
        const salesSheet = XLSX.utils.json_to_sheet(this.sales);
        XLSX.utils.book_append_sheet(workbook, salesSheet, "Sales");

        // Export Purchases
        const purchasesSheet = XLSX.utils.json_to_sheet(this.purchases);
        XLSX.utils.book_append_sheet(workbook, purchasesSheet, "Purchases");

        // Export Inventory
        const inventorySheet = XLSX.utils.json_to_sheet(this.inventory);
        XLSX.utils.book_append_sheet(workbook, inventorySheet, "Inventory");

        const documents = knownFolders.documents();
        const filePath = documents.path + "/tasty_export.xlsx";
        
        const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });
        const file = documents.getFile("tasty_export.xlsx");
        file.writeSync(wbout, err => {
            if (err) console.error('Error saving Excel file:', err);
        });
        
        return filePath;
    }
}

let store = null;

export function initializeStore() {
    store = new Store();
}

export function getStore() {
    return store;
}