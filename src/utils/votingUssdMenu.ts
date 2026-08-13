class VotingMenu {
  static MainMenu(): string {
    return (
      "Welcome to Aquinas SRC Voting System\r\n" +
      "\n" +
      "1. Vote\n" +
      "7. Contact Us\n"
    );
  }

  static EnterNomineeCode(): string {
    return "Please enter nominee code\r\n";
  }
  static ConfirmNomineeDetails({
    nomineeName,
    categoryName,
  }: {
    nomineeName: string;
    categoryName: string;
  }): string {
    return `Please confirm nominee details\r\nNominee Name: ${nomineeName?.toUpperCase()}\r\nCategory Name: ${categoryName?.toUpperCase()}\r\n\n1. Confirm\r\n0. Back`;
  }
  static ConfirmNumberOfVotes({
    numberOfVotes,
    amount,
  }: {
    numberOfVotes: number;
    amount: number;
  }): string {
    return `Please confirm number of votes\r\nNumber of votes: ${numberOfVotes}\r\nAmount: GH₵ ${amount}\r\n\n1. Confirm`;
  }

  static EnterNumberOfVotes(amntPerVote: number): string {
    return `Please enter number of votes\r\nAmount per vote: GH₵ ${amntPerVote}`;
  }

  static ContactMenu(): string {
    return (
      "Contact us on\r\n" + "Call or whatsapp: 0240084448\r\n" + "Thank you."
    );
  }

  static MenuSupportAssist(): string {
    return "Kindly call or whatsapp 0240084448 for assistance\r\n";
  }

  static RequestError(): string {
    return (
      "Sorry Unable to complete request\r\n" +
      "Kindly Call 0240084448  to follow up\r\n" +
      "or request assist. Thank you."
    );
  }
}

export default VotingMenu;
