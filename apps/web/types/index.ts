export type Document = {
    id: string;
    title: string;
    name: string;
    content: any;
    saveStatus: string;
    wordsCount: number;
    htmlContent: string;
    markdown: string;
    isRenaming?: boolean;
    icon?: string;
  };