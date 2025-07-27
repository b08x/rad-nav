
export enum Role {
  SupportEngineer = 'Support Engineer',
  SystemArchitect = 'System Architect',
  ClinicalStaff = 'Clinical Staff',
  LMTrainer = 'LM Trainer',
}

export enum Tab {
  SystemArchitecture = 'System Architecture Explorer',
  SupportCenter = 'Support Operations Center',
  KnowledgeEngine = 'Knowledge Extraction Engine',
  DatasetGenerator = 'Dataset Generator',
}

export interface SystemComponent {
  id: string;
  name: string;
  description: string;
  details: string[];
  position: { top: string; left: string; };
}

export interface Connection {
    from: string;
    to: string;
    label: string;
}

export interface TreeNode {
  text: string;
  options?: { text: string; next: string }[];
  resolution?: string;
  colorClass: string;
}

export type DecisionTree = Record<string, TreeNode>;

export interface IncidentAssessmentDoc {
    id: string;
    title: string;
    content: string;
}
