export interface IPayOSWebhook {
  code: string;
  desc: string;
  success: boolean;
  data: {
    orderCode: number;
    amount: number;
    description: string;
    accountNumber: string;
    reference: string;
    transactionDateTime: string;
    currency: string;
    paymentLinkId: string;
    code: string;
    desc: string;
    counterAccountBankId: string;
    counterAccountBankName: string;
    counterAccountName: string;
    counterAccountNumber: string;
    virtualAccountName: string;
    virtualAccountNumber: string;
  };
  signature: string;
}

// Example usage:
// const webhookData = {
//     code: "00",
//     desc: "success",
//     success: true,
//     data: {
//         orderCode: 123,
//         amount: 3000,
//         description: "VQRIO123",
//         accountNumber: "12345678",
//         reference: "TF230204212323",
//         transactionDateTime: "2023-02-04 18:25:00",
//         currency: "VND",
//         paymentLinkId: "124c33293c43417ab7879e14c8d9eb18",
//         code: "00",
//         desc: "Thành công",
//         counterAccountBankId: "",
//         counterAccountBankName: "",
//         counterAccountName: "",
//         counterAccountNumber: "",
//         virtualAccountName: "",
//         virtualAccountNumber: "",
//     },
//     signature: "412e915d2871504ed31be63c8f62a149a4410d34c4c42affc9006ef9917eaa03",
// };
