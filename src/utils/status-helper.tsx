const getStatusColor = (status: string): string => {
  switch (status) {
    case "NEW":
      return "#00FF00";
    case "ACCEPTED":
      return "#ff6d01";
    case "COMPLETED":
      return "#1c39bb";
    case "CANCELLED":
      return "#b71c1c";
    default:
      return "black"; // Default color
  }
};

const getStatusBGColor = (status: string): string => {
  switch (status) {
    case "NEW":
      return "#71dc62";
    case "ACCEPTED":
      return "#ff6d01";
    case "COMPLETED":
      return "#1c39bb";
    case "CANCELLED":
      return "#b71c1c";
    default:
      return "black"; // Default color
  }
};
export { getStatusBGColor, getStatusColor };
