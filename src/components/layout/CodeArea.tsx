
import { GeneratedCode } from '@/services/apiTypes';
import CodeDisplay from '@/components/CodeDisplay';

interface CodeAreaProps {
  code: GeneratedCode;
}

const CodeArea = ({ code }: CodeAreaProps) => {
  return (
    <div className="flex-1 overflow-hidden flex-col border-l border-border">
      <CodeDisplay code={code} />
    </div>
  );
};

export default CodeArea;
