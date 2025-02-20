import { z } from "zod";

// Luhn algorithm to validate a credit card number
function luhnCheck(value: string): boolean {
  let sum = 0;
  let shouldDouble = false;

  // Loop through the digits from right to left
  for (let i = value.length - 1; i >= 0; i--) {
    let digit = parseInt(value.charAt(i), 10);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9; // Sum digits of double values (e.g., 16 -> 1 + 6 = 7)
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

const creditCardSchema = z
  .string()
  .regex(/^\d{13,19}$/, {
    message: "Credit card number must be between 13 and 19 digits",
  }) // Check for length
  .refine(luhnCheck, {
    message: "Invalid credit card number (Luhn check failed)",
  });

// card type prefix validation
export const visaPrefixSchema = z
  .string()
  .regex(/^4/, { message: "Visa cards must start with a '4'" });
export const mastercardPrefixSchema = z
  .string()
  .regex(/^5/, { message: "MasterCard cards must start with a '5'" });

// Example of how to validate a credit card number
export function validateCreditCard(cardNumber: string) {
  const result = creditCardSchema.safeParse(cardNumber);

  if (result.success) {
    console.log("Valid credit card number!");
    return result.data; // Return the valid card number
  } else {
    console.log("Invalid credit card number:", result.error.errors);
    return null;
  }
}
