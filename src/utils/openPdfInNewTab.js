export const openPdfInNewTab = async (getPdfUrl) => {
  const pendingTab = window.open('', '_blank', 'noopener,noreferrer');

  try {
    const pdfUrl = await getPdfUrl();

    if (pendingTab) {
      pendingTab.opener = null;
      pendingTab.location.replace(pdfUrl);
      return pdfUrl;
    }

    const openedTab = window.open(pdfUrl, '_blank', 'noopener,noreferrer');

    if (!openedTab) {
      throw new Error('Unable to open a new browser tab for the PDF');
    }

    openedTab.opener = null;
    return pdfUrl;
  } catch (error) {
    if (pendingTab) {
      pendingTab.close();
    }

    throw error;
  }
};