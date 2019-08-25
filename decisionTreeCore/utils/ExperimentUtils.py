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


def read_tree(tree: List[str]) -> List[Node]:
    nodes: List[Node] = list()
    stack: List[Node] = list()
    for row in tree:
        if len(stack) > 0:
            if stack[-1].name.count("|") > row.count("|"):
                stack.pop()
        if row.count("|") == 0:
            parent = Node(row)
            nodes.append(parent)
            stack.append(parent)
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
    return nodes


def get_json_tree(tree: List[Node]) -> str:
    return dumper(tree)
