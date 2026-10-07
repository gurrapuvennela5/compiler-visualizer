# Supported Language Features

The project will support a defined educational subset of C, C++, and Java.

## Common Features

### Data Types
- int
- float
- char

### Variables
- Declaration
- Initialization
- Assignment

### Expressions
- Arithmetic: +, -, *, /
- Relational: <, >, <=, >=, ==, !=
- Parenthesized expressions

### Control Flow
- if
- if-else
- while
- for

### Functions / Methods
- Basic declarations and calls, subject to parser scope

### Input / Output
- Basic language-appropriate output constructs

## Language-Specific Examples

### C

```c
int a = 10;
int b = 20;
int c = a + b;
printf("%d", c);
```

### C++

```cpp
int a = 10;
int b = 20;
int c = a + b;
cout << c;
```

### Java

```java
int a = 10;
int b = 20;
int c = a + b;
System.out.println(c);
```

## Out of Scope for Initial Version

- Full C/C++/Java language specification
- Advanced C++ templates
- Complex Java generics
- Multithreading
- Advanced memory management
- Full preprocessor implementation
- Complete JVM bytecode generation
- Full native machine-code generation

The supported subset may be expanded after the core pipeline is stable.
