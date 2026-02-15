export const getImageSizes = (variant: "default" | "featured") => {
  if (variant === "featured") {
    return "(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 40vw";
  }
  return "(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw";
};

export const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("ar-JO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};