export interface GuideSection {
    id: string;
    title: string;
    iconType: 'info' | 'warning' | 'legal' | 'check';
    content: string | React.ReactNode;
}

export interface GuideStep {
    step: number;
    actor: string;
    description: string;
}
