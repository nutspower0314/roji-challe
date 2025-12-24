import {
  ConditionThinkingBoard,
  type ConditionThinkingBoardProps,
} from './ConditionThinkingBoard';
import { EliminationThinkingBoard } from './EliminationThinkingBoard';
import { HypothesisThinkingBoard } from './HypothesisThinkingBoard';
import { OrderingThinkingBoard } from './OrderingThinkingBoard';

type EliminationBoardProps = {
  conditions: ConditionThinkingBoardProps['conditions'];
  choiceIds: string[];
  selectedChoiceIds: Array<string | null>;
  choiceLabels?: Record<string, string>;
  onToggleChoice: (choiceId: string) => void;
};

type OrderingBoardProps = {
  conditions: ConditionThinkingBoardProps['conditions'];
  memo: string;
  hypotheses: string[];
  onMemoChange: (value: string) => void;
  onAddHypothesis: (label: string) => void;
  onRemoveHypothesis: (label: string) => void;
};

type HypothesisBoardProps = {
  selectedLabel: string | null;
  memo: string;
  onMemoChange: (value: string) => void;
};

type ThinkingBoardProps =
  | ({ problemType: 'condition' } & ConditionThinkingBoardProps)
  | ({ problemType: 'elimination' } & EliminationBoardProps)
  | ({ problemType: 'ordering' } & OrderingBoardProps)
  | ({ problemType: 'hypothesis' } & HypothesisBoardProps);

export function ThinkingBoard({
  problemType,
  ...rest
}: ThinkingBoardProps) {
  if (problemType === 'condition') {
    return <ConditionThinkingBoard {...(rest as ConditionThinkingBoardProps)} />;
  }
  if (problemType === 'elimination') {
    const props = rest as EliminationBoardProps;
    return (
      <EliminationThinkingBoard
        conditions={props.conditions}
        choiceIds={props.choiceIds}
        selectedChoiceIds={props.selectedChoiceIds}
        choiceLabels={props.choiceLabels}
        onToggle={props.onToggleChoice}
      />
    );
  }
  if (problemType === 'ordering') {
    const props = rest as OrderingBoardProps;
    return (
      <OrderingThinkingBoard
        conditions={props.conditions}
        memo={props.memo}
        hypotheses={props.hypotheses}
        onMemoChange={props.onMemoChange}
        onAddHypothesis={props.onAddHypothesis}
        onRemoveHypothesis={props.onRemoveHypothesis}
      />
    );
  }
  if (problemType === 'hypothesis') {
    const props = rest as HypothesisBoardProps;
    return (
      <HypothesisThinkingBoard
        selectedLabel={props.selectedLabel}
        memo={props.memo}
        onMemoChange={props.onMemoChange}
      />
    );
  }
  return null;
}
