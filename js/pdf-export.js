(function () {
  const PDF_FILENAME = "Svetlana-Oleynikova-vizitka.pdf";

  function isFileProtocol() {
    return window.location.protocol === "file:";
  }

  function getHtml2Pdf() {
    const h = window.html2pdf;
    if (typeof h === "function") return h;
    if (h && typeof h.default === "function") return h.default;
    return null;
  }

  function isHtml2PdfAvailable() {
    return getHtml2Pdf() !== null;
  }

  function buildOptions() {
    const root = document.documentElement;
    const w = root.scrollWidth;
    const h = Math.max(root.scrollHeight, root.clientHeight);

    return {
      margin: [8, 8, 8, 8],
      filename: PDF_FILENAME,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: false,
        scrollX: 0,
        scrollY: 0,
        windowWidth: w,
        windowHeight: h,
        ignoreElements: (el) => el.classList?.contains("no-print") === true,
        onclone: (clonedDoc) => {
          clonedDoc.querySelectorAll(".no-print").forEach((node) => node.remove());
        },
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },
      pagebreak: {
        mode: ["css", "legacy"],
      },
    };
  }

  function openPrintFallback() {
    try {
      window.print();
    } catch (e) {
      console.error(e);
    }
  }

  async function downloadPdf() {
    console.log("клик сработал");

    const btn = document.getElementById("pdf-download-btn");
    if (!btn) {
      console.warn("кнопка не найдена");
      return;
    }

    if (isFileProtocol()) {
      alert(
        "PDF-экспорт работает через локальный сервер. Запустите проект через Live Server."
      );
      return;
    }

    if (window.__html2pdfLoadError || !isHtml2PdfAvailable()) {
      console.warn("html2pdf недоступен");
      alert("Не удалось загрузить PDF-библиотеку. Проверьте интернет или CDN.");
      openPrintFallback();
      return;
    }

    console.log("html2pdf доступен");

    btn.disabled = true;
    const label = btn.textContent;
    btn.textContent = "Готовим PDF…";

    const scrollY = window.scrollY;
    window.scrollTo(0, 0);

    try {
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }

      console.log("экспорт начат");
      await getHtml2Pdf().set(buildOptions()).from(document.body).save();
      console.log("экспорт завершён");
    } catch (err) {
      console.error("ошибка экспорта:", err);
      alert(
        "Автоматический PDF не удалось создать. Откроется окно печати — сохраните как PDF через системный диалог."
      );
      openPrintFallback();
    } finally {
      window.scrollTo(0, scrollY);
      btn.disabled = false;
      btn.textContent = label;
    }
  }

  function init() {
    const btn = document.getElementById("pdf-download-btn");
    if (!btn) {
      console.warn("кнопка не найдена");
      return;
    }

    console.log("кнопка найдена");
    btn.addEventListener("click", downloadPdf);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
