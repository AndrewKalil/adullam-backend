import { asc, desc } from "drizzle-orm";

import { products } from "~db";

import { ListProductsQuery } from "./products.types";

export const buildOrderBy = (sort: ListProductsQuery["sort"]) => {
  switch (sort) {
    case "name_asc":
      return asc(products.name);
    case "name_desc":
      return desc(products.name);
    case "price_asc":
      return asc(products.price);
    case "price_desc":
      return desc(products.price);
    case "created_asc":
      return asc(products.createdAt);
    default:
      return desc(products.createdAt);
  }
};
