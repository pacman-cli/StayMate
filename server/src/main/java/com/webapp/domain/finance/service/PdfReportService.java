package com.webapp.domain.finance.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

import org.springframework.stereotype.Service;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.webapp.domain.finance.dto.EarningDto;

@Service
public class PdfReportService {

  public byte[] generateEarningsReport(List<EarningDto> earnings) throws DocumentException, IOException {
    try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
      Document document = new Document(PageSize.A4.rotate());
      PdfWriter.getInstance(document, out);

      document.open();

      // Title
      Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
      Paragraph title = new Paragraph("Earnings Report", titleFont);
      title.setAlignment(Element.ALIGN_CENTER);
      title.setSpacingAfter(20);
      document.add(title);

      // Table
      PdfPTable table = new PdfPTable(6);
      table.setWidthPercentage(100);
      table.setWidths(new float[] { 15, 10, 25, 15, 15, 20 });

      // Header
      addHeader(table, "Date");
      addHeader(table, "Booking ID");
      addHeader(table, "Property");
      addHeader(table, "Gross");
      addHeader(table, "Net");
      addHeader(table, "Status");

      // Data
      for (EarningDto earning : earnings) {
        addCell(table, earning.getDate() != null ? earning.getDate().toString() : "");
        addCell(table, earning.getBookingId() != null ? earning.getBookingId().toString() : "");
        addCell(table, earning.getPropertyTitle() != null ? earning.getPropertyTitle() : "");
        addCell(table, String.format("$%.2f", earning.getAmount()));
        addCell(table, String.format("$%.2f", earning.getNetAmount()));
        addCell(table, earning.getStatus() != null ? earning.getStatus().name() : "");
      }

      document.add(table);
      document.close();

      return out.toByteArray();
    }
  }

  private void addHeader(PdfPTable table, String text) {
    PdfPCell cell = new PdfPCell(new Phrase(text, FontFactory.getFont(FontFactory.HELVETICA_BOLD)));
    cell.setHorizontalAlignment(Element.ALIGN_CENTER);
    cell.setPadding(5);
    table.addCell(cell);
  }

  private void addCell(PdfPTable table, String text) {
    PdfPCell cell = new PdfPCell(new Phrase(text));
    cell.setPadding(5);
    table.addCell(cell);
  }
}
