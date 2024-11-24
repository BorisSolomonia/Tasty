export function onNavigatingTo(args) {
    const page = args.object;
    
    page.bindingContext = {
        onProductsTap() {
            page.frame.navigate('pages/manage/products-page');
        },
        onCustomersTap() {
            page.frame.navigate('pages/manage/customers-page');
        },
        onProvidersTap() {
            page.frame.navigate('pages/manage/providers-page');
        }
    };
}