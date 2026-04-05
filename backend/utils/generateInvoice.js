const generateInvoice = (ride) => {
    const invoiceNumber =
        "INV-" + Date.now() + "-" + Math.floor(Math.random() * 1000);

    return {
        invoiceNumber,
        generatedAt: new Date()
    };
};

module.exports = generateInvoice;