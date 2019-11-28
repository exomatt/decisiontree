from __future__ import annotations

import re
import shutil
from typing import List

from jsonweb.encode import to_object, dumper
import os


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


@to_object()
class ProgressData:
    def __init__(self, time: float, progress_percent: float) -> None:
        self.progress_percent: str = progress_percent
        self.time: float = time


def read_from_file(file_path) -> List[str]:
    with open(file_path, "r") as f:
        words: List[str] = f.readlines()
        indices = [i for i, elem in enumerate(words) if '________' in elem.lower()]
        only_tree: List[str] = words[indices[2] + 1:indices[3]]
        return only_tree


def read_tree_new(tree: List[str]) -> Node:
    nodes: List[Node] = list()
    temp: List[Node] = list()
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
            if ":" in row:
                split = row.split(":")
                child = Node(split[0])
                stack[-1].add_child(child)
                stack.append(child)
                child = Node(row.count("|") * "|" + split[1])
                stack[-1].add_child(child)
            else:
                child = Node(row)
                stack[-1].add_child(child)
                stack.append(child)

            continue
        elif row.count("|") == stack[-1].name.count("|"):
            if ":" in row:
                split = row.split(":")
                child = Node(split[0])
                stack.pop()
                stack[-1].add_child(child)
                stack.append(child)
                child = Node(row.count("|") * "|" + split[1])
                stack[-1].add_child(child)
            else:
                child = Node(row)
                stack.pop()
                stack[-1].add_child(child)
                stack.append(child)
            continue

    stack.clear()

    if len(nodes) > 1:
        root = Node(name="root")
        for node in nodes:
            root.add_child(node)
        nodes.clear()
        nodes.append(root)

    first: Node = nodes[0]
    previous_node: Node = nodes[0]
    actual_node: Node = nodes[0]
    temp_node: Node = nodes[0]

    return nodes[0]


def read_tree(tree: List[str]) -> Node:
    nodes: List[Node] = list()
    temp: List[Node] = list()
    stack: List[Node] = list()
    for row in tree:
        if len(stack) > 0:
            while stack[-1].name.count("|") > row.count("|"):
                stack.pop()
        if row.count("|") == 0:
            if len(nodes) > 0 and row.replace("<=", "").replace(">", "").replace(" ", "").replace("\n", "") == nodes[
                -1].name.replace("<=", "").replace(
                ">", "").replace(" ", "").replace("\n", ""):
                stack.append(nodes[-1])
                continue
            parent = Node(row)
            stack.append(parent)
            nodes.append(parent)
            continue
        elif row.count("|") > stack[-1].name.count("|"):
            if row.replace("<=", "").replace(">", "").replace(" ", "").replace("\n", "") == stack[-1].name.replace("<=",
                                                                                                                   "").replace(
                ">", "").replace(" ", "").replace("\n", "") and ":" not in row:
                print("jestem  te same nazwy przy warunku wiecej || i bez : ")
                continue
            if ":" in row:
                if row.split(":")[0].replace("<=", "").replace(">", "").replace(" ", "").replace("\n", "") == \
                        stack[-1].name.split(":")[0].replace("<=", "").replace(
                            ">", "").replace(" ", "").replace("\n", ""):
                    print("jestem xddd ")
                    split = row.split(":")
                    child = Node(split[1])
                    stack[-1].add_child(child)
                    continue
                split = row.split(":")
                child = Node(split[0])
                stack[-1].add_child(child)
                stack.append(child)
                child = Node(split[1])
                stack[-1].add_child(child)
            else:
                child = Node(row)
                stack[-1].add_child(child)
                stack.append(child)

            continue
        elif row.count("|") == stack[-1].name.count("|"):
            if row.replace("<=", "").replace(">", "").replace(" ", "").replace("\n", "") == stack[-1].name.replace("<=",
                                                                                                                   "").replace(
                ">", "").replace(" ", "").replace("\n", "") and ":" not in row:
                print("jestem  te same nazwy  i bez : ")
                continue
            # else:
            #     stack.pop()

            if ":" in row:
                if row.split(":")[0].replace("<=", "").replace(">", "").replace(" ", "").replace("\n", "") == \
                        stack[-1].name.split(":")[0].replace("<=", "").replace(
                            ">", "").replace(" ", "").replace("\n", ""):
                    print("jestem xddd ")
                    split = row.split(":")
                    child = Node(split[1])
                    stack[-1].add_child(child)
                    continue
                print("jestem  te rózne  nazwy  i  : ")
                split = row.split(":")
                child = Node(split[0])
                stack[-1].add_child(child)
                stack.append(child)
                child = Node(split[1])
                stack[-1].add_child(child)
            else:
                child = Node(row)
                stack[-1].add_child(child)
                stack.append(child)
            continue
    print(dumper(nodes[0]))
    return nodes[0]


def get_json_tree(tree: List[Node], info) -> str:
    print(info)
    info['tree'] = tree
    return dumper(info)


def get_json_progress(progress: ProgressData) -> str:
    return dumper(progress)


def get_tree(file_path: str) -> str:
    info = read_extra_info(file_path)
    tree_from_file = read_from_file(file_path)
    tree_structure = read_tree(tree_from_file)
    json_tree = get_json_tree(tree_structure, info)
    return json_tree


def read_extra_info(file_path: str):
    floats = re.compile(r'\d+\.\d+')
    ints = re.compile(r'\d+')
    with open(file_path, "r") as f:
        words: List[str] = f.readlines()
        info = {}
        for word in words:
            if "Tree Size:" in word:
                info['Tree Size'] = float(ints.findall(word)[0])
            elif "Time:" in word:
                info['Time'] = float(ints.findall(word)[0])
            elif "Evaluation on training data" in word:
                info['Evaluation on training data'] = float(ints.findall(word)[0])
            elif "Result on training data:" in word:
                info['Result on training data'] = float(floats.findall(word)[0])
            elif "Evaluation on test data" in word:
                info['Evaluation on test data'] = float(ints.findall(word)[0])
            elif "Result on test data:" in word:
                info['Result on test data'] = float(floats.findall(word)[0])
        return info


class ConfigFile(object):
    def __init__(self, name: str, runs: int = 5, mutationomp: bool = True, crossoveromp: bool = True,
                 selectionomp: bool = True,
                 selectiontype: str = "normal",
                 sizeofpopulation: int = 64,
                 maximumiterations: int = 1000, minimumiterations: int = 1000,
                 probabilityofmutation: int = 80, probabilityofcrossover: int = 20,
                 selectionpressure: float = 1.2) -> None:
        self.name = name
        self.runs = runs
        self.mutationomp = mutationomp
        self.crossoveromp = crossoveromp
        self.selectionomp = selectionomp
        self.selectiontype = selectiontype
        self.sizeofpopulation = sizeofpopulation
        self.maximumiterations = maximumiterations
        self.minimumiterations = minimumiterations
        self.probabilityofmutation = probabilityofmutation
        self.probabilityofcrossover = probabilityofcrossover
        self.selectionpressure = selectionpressure


from rest_framework import serializers


class ConfigFileSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=250)
    runs = serializers.IntegerField()
    mutationomp = serializers.BooleanField()
    crossoveromp = serializers.BooleanField(required=False)
    selectionomp = serializers.BooleanField(required=False)
    selectiontype = serializers.CharField(max_length=40, required=False)
    sizeofpopulation = serializers.IntegerField(required=False)
    maximumiterations = serializers.IntegerField(required=False)
    minimumiterations = serializers.IntegerField(required=False)
    probabilityofmutation = serializers.IntegerField(required=False)
    probabilityofcrossover = serializers.IntegerField(required=False)
    selectionpressure = serializers.FloatField(required=False)

    def create(self, validated_data):
        return ConfigFile(**validated_data)

    def update(self, instance, validated_data):
        instance.name = validated_data.get('name', instance.name)
        instance.runs = validated_data.get('runs', instance.runs)
        instance.mutationomp = validated_data.get('mutationomp', instance.mutationomp)
        instance.crossoveromp = validated_data.get('crossoveromp', instance.crossoveromp)
        instance.selectionomp = validated_data.get('selectionomp', instance.selectionomp)
        instance.selectiontype = validated_data.get('selectiontype', instance.selectiontype)
        instance.sizeofpopulation = validated_data.get('sizeofpopulation', instance.created)
        instance.maximumiterations = validated_data.get('maximumiterations', instance.created)
        instance.minimumiterations = validated_data.get('minimumiterations', instance.created)
        instance.probabilityofmutation = validated_data.get('probabilityofmutation', instance.created)
        instance.probabilityofcrossover = validated_data.get('probabilityofcrossover', instance.created)
        instance.selectionpressure = validated_data.get('selectionpressure', instance.created)
        instance.save()
        return instance


def generate_file_name(file_path) -> str:
    if os.path.isfile(file_path):
        expand = 0
        while True:
            expand += 1
            file_extension = file_path.rsplit(".", 1)[1]
            file_name = file_path.split("/")[-1]
            temp_path = "/".join(file_path.split("/")[0:-1])
            temp_file_name = re.sub(r'\([^)]*\)', '', file_name)
            temp_new_path = temp_path + "/" + temp_file_name
            new_file_name = temp_new_path.rsplit(".")[0] + "(" + str(expand) + ")." + file_extension
            if os.path.isfile(new_file_name):
                continue
            else:
                file_path = new_file_name
                break
    return file_path


def generate_dir_name(file_path) -> str:
    if os.path.isdir(file_path):
        expand = 0
        while True:
            expand += 1
            new_file_name = f'{file_path.rsplit("/")[3]}({str(expand)})'
            if os.path.isdir(f'{"/".join(file_path.rsplit("/")[:3])}/{new_file_name}'):
                continue
            else:
                file_path = f'{"/".join(file_path.rsplit("/")[:3])}/{new_file_name}'
                break
    return file_path


def copytree(src, dst, symlinks=False, ignore=None):
    for item in os.listdir(src):
        s = os.path.join(src, item)
        d = os.path.join(dst, item)
        if os.path.isdir(s):
            shutil.copytree(s, d, symlinks, ignore)
        else:
            shutil.copy2(s, d)
