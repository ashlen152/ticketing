import React from "react";

export const errorHandler = (errors) => {
  if (errors.response) {
    return errors.response.data.errors.map((er) => (
      <li key={er.field}>
        {er.field}: {er.message}{" "}
      </li>
    ));
  }
  return;
};
