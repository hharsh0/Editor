export type Document = {
    id: string;
    name: string;
    content: any;
    saveStatus: string;
    wordsCount: number;
    htmlContent: string;
    markdown: string;
    isRenaming?: boolean;
    icon?: string;
  };