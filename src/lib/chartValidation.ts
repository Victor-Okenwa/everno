/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
  path?: string;
}

export const validateChartData = (
  chartData: { columns: any[]; data: any[] },
  chartType: string,
): ValidationResult => {
  const { columns, data } = chartData;
  const isRowColorChart = ["pie", "donut"].includes(chartType);

  // Check if we have any data at all
  if (!columns || columns.length === 0) {
    return {
      isValid: false,
      error: "At least one column is required",
      path: "columns",
    };
  }

  if (!data || data.length === 0) {
    return {
      isValid: false,
      error: "At least one data row is required",
      path: "data",
    };
  }

  // Chart-specific column validation
  if (isRowColorChart && columns.length !== 2) {
    return {
      isValid: false,
      error: "Pie/Donut charts require exactly 2 columns",
      path: "columns",
    };
  }

  if (!isRowColorChart && columns.length < 2) {
    return {
      isValid: false,
      error: "At least 2 columns are required",
      path: "columns",
    };
  }

  // Validate column names
  for (const [colIndex, column] of columns.entries()) {
    if (!column.name || column.name.trim() === "") {
      return {
        isValid: false,
        error: `Column ${colIndex + 1} name is required`,
        path: `columns.${colIndex}.name`,
      };
    }
  }

  // Validate each data row
  for (const [rowIndex, row] of data.entries()) {
    let hasAnyData = false;

    for (const [colIndex, column] of columns.entries()) {
      const value = row[column.name];

      // Check if this field has data
      if (value !== "" && value !== null && value !== undefined) {
        hasAnyData = true;
      }

      // Check for empty fields (but allow completely empty rows to be filtered out)
      if (value === "" || value === null || value === undefined) {
        // If any field in the row has data, then all fields should have data
        const rowHasData = columns.some((col) => {
          const val = row[col.name];
          return val !== "" && val !== null && val !== undefined;
        });

        if (rowHasData) {
          return {
            isValid: false,
            error: `${column.name} is required in row ${rowIndex + 1}`,
            path: `data.${rowIndex}.${column.name}`,
          };
        }
      }

      // Validate data types for value columns (skip if empty)
      if (value !== "" && value !== null && value !== undefined) {
        if (colIndex > 0 || (isRowColorChart && colIndex === 1)) {
          // Value columns should be numbers for most charts
          const numValue = Number(value);
          if (isNaN(numValue)) {
            return {
              isValid: false,
              error: `${column.name} must be a valid number in row ${rowIndex + 1}`,
              path: `data.${rowIndex}.${column.name}`,
            };
          }
          if (numValue < 0) {
            return {
              isValid: false,
              error: `${column.name} must be a positive number in row ${rowIndex + 1}`,
              path: `data.${rowIndex}.${column.name}`,
            };
          }
        }
      }
    }

    // Skip validation for completely empty rows (they'll be filtered out)
    if (!hasAnyData) {
      continue;
    }
  }

  // Check if we have at least one valid row with data
  const validRows = data.filter((row) =>
    columns.some((col) => {
      const val = row[col.name];
      return val !== "" && val !== null && val !== undefined;
    }),
  );

  if (validRows.length === 0) {
    return {
      isValid: false,
      error: "At least one complete data row is required",
      path: "data",
    };
  }

  return { isValid: true };
};

export const validateField = (
  value: any,
  fieldPath: string,
  columns: any[],
  chartType: string,
): string | undefined => {
  const pathParts = fieldPath.split(".");
  const isRowColorChart = ["pie", "donut"].includes(chartType);

  // Handle column name validation
  if (pathParts[0] === "columns" && pathParts[2] === "name") {
    if (!value || value.trim() === "") {
      return "Column name is required";
    }
    return undefined;
  }

  // Handle data field validation
  if (pathParts[0] === "data") {
    const fieldName = pathParts[2];
    const columnIndex = columns?.findIndex((col) => col.name === fieldName);

    // Allow empty fields - they'll be validated at the row level
    if (value === "" || value === null || value === undefined) {
      return undefined;
    }

    // Type validation for value columns
    if (columnIndex > 0 || (isRowColorChart && columnIndex === 1)) {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        return `${fieldName} must be a valid number`;
      }
      if (numValue < 0) {
        return `${fieldName} must be a positive number`;
      }
    }
  }

  return undefined;
};
