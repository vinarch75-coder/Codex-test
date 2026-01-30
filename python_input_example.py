"""Simple example of taking input in Python for a calculator."""


def main() -> None:
    """Prompt for two numbers and an operator, then print the result."""
    raw_first = input("Enter the first number: ")
    raw_second = input("Enter the second number: ")
    operator = input("Enter an operator (+, -, *, /): ")

    first = float(raw_first)
    second = float(raw_second)

    if operator == "+":
        result = first + second
    elif operator == "-":
        result = first - second
    elif operator == "*":
        result = first * second
    elif operator == "/":
        result = first / second
    else:
        raise ValueError(f"Unsupported operator: {operator}")

    print(f"Result: {result}")


if __name__ == "__main__":
    main()
