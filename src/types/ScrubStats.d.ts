export interface ScrubStats {
  replacedNames: number;
  replacedPhones: number;
  replacedAddresses: number;
  replacedStudentIds: number;
  facesBlurred?: number;
  tokensReplaced?: number;
}
