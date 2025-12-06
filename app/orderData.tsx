// This component returns an array of pizza order data
const getPizzaOrders = () => [
  {
    customer: "John Doe",
    address: "123 Main St, Springfield",
    pizza: "Pepperoni",
    size: "Large",
    status: "Out for delivery",
    orderReadyTime: "30 min",
  },
  {
    customer: "Jane Smith",
    address: "456 Elm St, Shelbyville",
    pizza: "Margherita",
    size: "Medium",
    status: "Preparing",
    orderReadyTime: "20 min",
  },
  {
    customer: "Alice Johnson",
    address: "789 Oak St, Capital City",
    pizza: "Veggie",
    size: "Small",
    status: "Delivered",
    orderReadyTime: "15 min",
  },
];

export default getPizzaOrders;
