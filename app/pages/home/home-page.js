import { getStore } from '../../store';
import { alert } from '@nativescript/core';
import { Frame } from '@nativescript/core';

export function onNavigatingTo(args) {
    const page = args.object;
    const store = getStore();
    
    page.bindingContext = {
        onSellTap() {
            Frame.topmost().navigate('pages/sell/sell-page');
        },
        onBuyTap() {
            Frame.topmost().navigate('pages/buy/buy-page');
        },
        onInventoryTap() {
            Frame.topmost().navigate('pages/inventory/inventory-page');
        },
        onManageTap() {
            Frame.topmost().navigate('pages/manage/manage-page');
        },
        onExportTap() {
            try {
                const filePath = store.exportToExcel();
                alert({
                    title: "Export Successful",
                    message: `Data exported to: ${filePath}`,
                    okButtonText: "OK"
                });
            } catch (error) {
                alert({
                    title: "Export Failed",
                    message: "Failed to export data to Excel",
                    okButtonText: "OK"
                });
            }
        }
    };
}