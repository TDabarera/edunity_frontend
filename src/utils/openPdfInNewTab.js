export const POPUP_BLOCKED_MESSAGE = 'Please allow popups for this site to view PDF';

const getResolvedPdfUrl = async ({ getImmediatePdfUrl, getPdfUrl }) => {
  let immediateError;

  if (typeof getImmediatePdfUrl === 'function') {
    try {
      const immediateUrl = await Promise.resolve(getImmediatePdfUrl());
      if (immediateUrl) {
        return immediateUrl;
      }
    } catch (error) {
      immediateError = error;
    }
  }

  if (typeof getPdfUrl === 'function') {
    const fallbackUrl = await Promise.resolve(getPdfUrl());
    if (fallbackUrl) {
      return fallbackUrl;
    }
  }

  if (immediateError) {
    throw immediateError;
  }

  throw new Error('PDF URL was not provided by the server');
};

export const openPdfInNewTab = async (config) => {
  const options = typeof config === 'function' ? { getPdfUrl: config } : (config || {});
  const { fallbackToSameTabWhenBlocked = true } = options;

  const pendingTab = window.open('', '_blank', 'noopener,noreferrer');

  if (!pendingTab) {
    if (fallbackToSameTabWhenBlocked) {
      const fallbackUrl = await getResolvedPdfUrl(options);
      window.location.assign(fallbackUrl);
      return fallbackUrl;
    }

    throw new Error(POPUP_BLOCKED_MESSAGE);
  }

  try {
    const pdfUrl = await getResolvedPdfUrl(options);
    pendingTab.opener = null;
    pendingTab.location.replace(pdfUrl);
    return pdfUrl;
  } catch (error) {
    pendingTab.close();
    throw error;
  }
};