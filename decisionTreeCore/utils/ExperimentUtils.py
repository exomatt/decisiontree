from __future__ import annotations

from typing import List

from jsonweb.encode import to_object, dumper


@to_object()
class Node:
    def __init__(self, name: str, children: List[Node] = None, attributes: List[str] = None) -> None:
        self.name: str = name
        self.children: List[Node] = children
        self.attributes: List[str] = attributes
        if children is None:
            self.children = list()
        if attributes is None:
            self.attributes = list()

    def add_child(self, children_to_add: Node) -> None:
        self.children.append(children_to_add)

    def add_attribute(self, attribute: str) -> None:
        self.attributes.append(attribute)


def read_from_file(file_path) -> List[str]:
    with open(file_path, "r") as f:
        words: List[str] = f.readlines()
        indices = [i for i, elem in enumerate(words) if '________' in elem.lower()]
        only_tree: List[str] = words[indices[2] + 1:indices[3]]
        return only_tree


def read_tree(tree: List[str]) -> Node:
    nodes: List[Node] = list()
    stack: List[Node] = list()
    for row in tree:
        if len(stack) > 0:
            if stack[-1].name.count("|") > row.count("|"):
                stack.pop()
        if row.count("|") == 0:
            parent = Node(row)
            stack.append(parent)
            nodes.append(parent)
            continue
        elif row.count("|") > stack[-1].name.count("|"):
            child = Node(row)
            stack[-1].add_child(child)
            stack.append(child)
            continue
        elif row.count("|") == stack[-1].name.count("|"):
            child = Node(row)
            stack.pop()
            stack[-1].add_child(child)
            stack.append(child)
            continue
    if len(nodes) > 1:
        root = Node(name="root")
        for node in nodes:
            root.add_child(node)
        nodes.clear()
        nodes.append(root)

    return nodes[0]


def get_json_tree(tree: List[Node]) -> str:
    return dumper(tree)


def get_tree(file_path: str) -> str:
    tree_from_file = read_from_file(file_path)
    tree_structure = read_tree(tree_from_file)
    json_tree = get_json_tree(tree_structure)
    return json_tree
