package com.example.finance.common.validation;

public final class CpfUtils {

    private CpfUtils() {
    }

    public static boolean isValid(String cpf) {
        if (cpf == null) {
            return false;
        }
        String digits = cpf.replaceAll("\\D", "");
        if (digits.length() != 11 || digits.chars().distinct().count() == 1) {
            return false;
        }
        int d1 = calculateDigit(digits, 10);
        int d2 = calculateDigit(digits, 11);
        return d1 == Character.getNumericValue(digits.charAt(9))
                && d2 == Character.getNumericValue(digits.charAt(10));
    }

    private static int calculateDigit(String cpf, int weight) {
        int sum = 0;
        for (int i = 0; i < weight - 1; i++) {
            sum += Character.getNumericValue(cpf.charAt(i)) * (weight - i);
        }
        int result = 11 - (sum % 11);
        return result > 9 ? 0 : result;
    }
}
