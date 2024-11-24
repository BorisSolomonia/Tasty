import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as XLSX from 'xlsx';

const Stack = createNativeStackNavigator();

// Store implementation
const useStore = () => {
  const [data, setData] = useState({
    inventory: [],
    customers: [],
    providers: [],
    products: [],
    sales: [],
    purchases: []
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('tastyData');
      if (storedData) {
        setData(JSON.parse(storedData));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveData = async (newData) => {
    try {
      await AsyncStorage.setItem('tastyData', JSON.stringify(newData));
      setData(newData);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const addCustomer = (customer) => {
    const newData = {
      ...data,
      customers: [...data.customers, { id: Date.now(), ...customer }]
    };
    saveData(newData);
  };

  const addProvider = (provider) => {
    const newData = {
      ...data,
      providers: [...data.providers, { id: Date.now(), ...provider }]
    };
    saveData(newData);
  };

  const addProduct = (product) => {
    const newData = {
      ...data,
      products: [...data.products, { id: Date.now(), ...product }],
      inventory: [...data.inventory, { id: Date.now(), name: product.name, quantity: 0 }]
    };
    saveData(newData);
  };

  const addSale = (sale) => {
    const newData = {
      ...data,
      sales: [...data.sales, { id: Date.now(), ...sale }],
      inventory: data.inventory.map(item => {
        const saleProduct = sale.products.find(p => p.name === item.name);
        return saleProduct
          ? { ...item, quantity: item.quantity - saleProduct.quantity }
          : item;
      })
    };
    saveData(newData);
  };

  const addPurchase = (purchase) => {
    const newData = {
      ...data,
      purchases: [...data.purchases, { id: Date.now(), ...purchase }],
      inventory: data.inventory.map(item => {
        const purchaseProduct = purchase.products.find(p => p.name === item.name);
        return purchaseProduct
          ? { ...item, quantity: item.quantity + purchaseProduct.quantity }
          : item;
      })
    };
    saveData(newData);
  };

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();

    // Export Sales
    const salesSheet = XLSX.utils.json_to_sheet(data.sales);
    XLSX.utils.book_append_sheet(workbook, salesSheet, "Sales");

    // Export Purchases
    const purchasesSheet = XLSX.utils.json_to_sheet(data.purchases);
    XLSX.utils.book_append_sheet(workbook, purchasesSheet, "Purchases");

    // Export Inventory
    const inventorySheet = XLSX.utils.json_to_sheet(data.inventory);
    XLSX.utils.book_append_sheet(workbook, inventorySheet, "Inventory");

    XLSX.writeFile(workbook, "tasty_export.xlsx");
  };

  return {
    data,
    addCustomer,
    addProvider,
    addProduct,
    addSale,
    addPurchase,
    exportToExcel
  };
};

// Screens
function HomeScreen({ navigation }) {
  const store = useStore();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tasty</Text>
      <TouchableOpacity
        style={[styles.button, styles.primaryButton]}
        onPress={() => navigation.navigate('Sell')}
      >
        <Text style={styles.buttonText}>SELL 📦</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={() => navigation.navigate('Buy')}
      >
        <Text style={styles.buttonText}>BUY 🛍️</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.outlineButton]}
        onPress={() => navigation.navigate('Inventory')}
      >
        <Text style={styles.buttonText}>INVENTORY 📊</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.outlineButton]}
        onPress={() => navigation.navigate('Manage')}
      >
        <Text style={styles.buttonText}>MANAGE ⚙️</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.outlineButton]}
        onPress={store.exportToExcel}
      >
        <Text style={styles.buttonText}>EXPORT 📊</Text>
      </TouchableOpacity>
    </View>
  );
}

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ title: 'Tasty' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'stretch',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  button: {
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
  },
  secondaryButton: {
    backgroundColor: '#2196F3',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#666',
  },
});

export default App;