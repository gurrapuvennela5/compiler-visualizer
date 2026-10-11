
import './ASTTree.css';

function getNodeLabel(node) {
    if (!node) return 'Unknown';

    switch (node.type) {
        case 'Program':
            return 'Program';

        case 'VariableDeclaration':
            return `Declaration: ${node.var_type} ${node.variable}`;

        case 'Assignment':
            return `Assignment: ${node.variable}`;

        case 'BinaryExpression':
            return `Operator: ${node.operator}`;

        case 'Identifier':
            return `Identifier: ${node.value}`;

        case 'IntegerLiteral':
            return `Integer: ${node.value}`;

        case 'FloatLiteral':
            return `Float: ${node.value}`;

        default:
            return node.type || 'Unknown';
    }
}

function getChildren(node) {
    if (!node) return [];

    switch (node.type) {
        case 'Program':
            return node.statements || [];

        case 'VariableDeclaration':
            return node.initializer ? [node.initializer] : [];

        case 'Assignment':
            return node.value ? [node.value] : [];

        case 'BinaryExpression':
            return [node.left, node.right].filter(Boolean);

        default:
            return [];
    }
}

function ASTNode({ node }) {
    if (!node) return null;

    const children = getChildren(node);

    return (
        <li className="ast-node">
            <div className={`ast-node-label ast-${node.type}`}>
                {getNodeLabel(node)}
            </div>

            {children.length > 0 && (
                <ul className="ast-children">
                    {children.map((child, index) => (
                        <ASTNode
                            key={`${child.type}-${child.line}-${child.column}-${index}`}
                            node={child}
                        />
                    ))}
                </ul>
            )}
        </li>
    );
}

function ASTTree({ ast }) {
    if (!ast) {
        return (
            <div className="ast-empty">
                Compile valid source code to see its Abstract Syntax Tree.
            </div>
        );
    }

    return (
        <div className="ast-tree-container">
            <ul className="ast-tree">
                <ASTNode node={ast} />
            </ul>
        </div>
    );
}

export default ASTTree;
