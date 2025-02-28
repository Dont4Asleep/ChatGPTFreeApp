import html2canvas from 'html2canvas';
import useStore from '@store/store';
import jsPDF from 'jspdf';
import { ChatInterface } from '@type/chat';
import { roles } from '@type/chat';
import { Theme } from '@type/theme';

export const isChats = (chats: any): chats is ChatInterface[] => {
  if (!Array.isArray(chats)) return false;

  for (const chat of chats) {
    if (!(typeof chat.title === 'string') || chat.title === '') return false;
    if (!(typeof chat.titleSet === 'boolean')) return false;

    if (!Array.isArray(chat.messages)) return false;
    for (const message of chat.messages) {
      if (!(typeof message.content === 'string')) return false;
      if (!(typeof message.role === 'string')) return false;
      if (!roles.includes(message.role)) return false;
    }

    if (!(typeof chat.config === 'object')) return false;
    if (!(typeof chat.config.temperature === 'number')) return false;
    if (!(typeof chat.config.presence_penalty === 'number')) return false;
  }

  return true;
};

export const htmlToImg = async (html: HTMLDivElement) => {
  const initialWidth = html.style.width;
  html.style.width = '1023px';
  const canvas = await html2canvas(html);
  html.style.width = initialWidth;
  const dataURL = canvas.toDataURL('image/png');
  return dataURL;
};

export const downloadImg = (imgData: string, fileName: string) => {
  const link = document.createElement('a');
  link.href = imgData;
  link.download = fileName;
  link.click();
  link.remove();
};

export const downloadPDF = (
  imageData: string,
  theme: Theme,
  fileName: string
) => {
  const pdf = new jsPDF('p', 'mm');
  const imageProps = pdf.getImageProperties(imageData);
  const pageHeight = pdf.internal.pageSize.getHeight();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const imgHeight = (imageProps.height * pageWidth) / imageProps.width;
  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imageData, 'PNG', 0, position, pageWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft >= 0) {
    position -= pageHeight;
    heightLeft -= pageHeight;
    pdf.addPage();
    pdf.addImage(imageData, 'PNG', 0, position, pageWidth, imgHeight);
  }

  if (heightLeft < 0) {
    heightLeft = -heightLeft;
    if (theme === 'dark') {
      pdf.setFillColor(52, 53, 65);
    } else {
      pdf.setFillColor(255, 255, 255);
    }
    pdf.rect(0, pageHeight - heightLeft - 3, pageWidth, heightLeft + 3, 'F');
  }

  pdf.save(fileName);
};

export const chatToMarkdown = (chat: ChatInterface) => {
  let markdown = `# ${chat.title}\n\n`;
  chat.messages.forEach((message) => {
    markdown += `### **${message.role}**:\n\n${message.content}\n\n---\n\n`;
  });
  return markdown;
};

export const downloadMarkdown = (markdown: string, fileName: string) => {
  const link = document.createElement('a');
  const markdownFile = new Blob([markdown], { type: 'text/markdown' });
  link.href = URL.createObjectURL(markdownFile);
  link.download = fileName;
  link.click();
  link.remove();
};
