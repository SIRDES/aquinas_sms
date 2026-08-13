interface LoanConfirmParams {
  amount: number;
  disbursementAmount: number;
  loanPeriod: string;
  processingFee: number;
  repaymentAmount: number;
  repaymentFee: number;
}

class Menu {
  static MainMenu(): string {
    return (
      "Welcome to St. Thomas Aquinas SHS\r\n" +
      // "1. Friday Test Results\n" +
      "\n" +
      "1. Form 1\n" +
      "2. Form 2\n" +
      "3. Form 3\r\n" +
      "7. Contact Us\n"
    );
  }

  static EnterStudentId(): string {
    return "Please enter student ID\r\n";
  }
  static FridayTestSelectWeekMenu(): string {
    return (
      "Select Date (week)\r\n" + "1. 28/02/2025 (3rd and 4th weeks)\r\n" + "2. 14/02/2025 (2nd week)"
    );
  }
  static SemesterSelect(form: string): string {
    return (
      "Select semester\r\n" + `1. Form ${form} Semester 1`
    );
  }
  static FormTwoSemesterSelect(): string {
    return (
      "Select semester\r\n" +
      "1. Form 1 Semester 2\n" +
      "2. Form 2 Semester 1\n"
    );
  }
  static FormThreeSemesterSelect(): string {
    return (
      "Select\r\n" +
      "1. Form 3 Semester 1\n"
      // "2. Mock 2\n"
    );
  }

  static ContactMenu(): string {
    return (
      "Contact us on\r\n" +
      "Call or whatsapp: 0247199122/0240084448\r\n" +
      "Thank you."
    );
  }

  static MenuSupportAssist(): string {
    return "Kindly call or whatsapp 0247199122/0240084448 for assistance\r\n";
  }

  static RequestError(): string {
    return (
      "Sorry Unable to complete request\r\n" +
      "Kindly Call 0247199122/0240084448  to follow up\r\n" +
      "or request assist. Thank you."
    );
  }
}

export default Menu;
