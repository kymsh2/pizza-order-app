const getStatusColor = (status: string): string => {
  switch (status) {
    case "NEW":
      return "green";
    case "ACCEPTED":
      return "#ff6d01";
    case "COMPLETED":
      return "blue";
    case "CANCELLED":
      return "red";
    default:
      return "black"; // Default color
  }
};
export { getStatusColor };
