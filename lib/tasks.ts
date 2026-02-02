export interface TestCase {
    id: string;
    input: string;
    expected_output: string;
    hidden: boolean;
}

export interface Task {
    id: string;
    title: string;
    description: string;
    starter_code: string;
    language: string;
    test_cases: TestCase[];
}

export const TASKS: Task[] = [
    {
        id: 'string-reversal',
        title: 'String Reversal',
        description: 'Read a string from standard input and print its reversal to standard out.',
        language: 'python',
        starter_code: 'import sys\n\n# Read from standard input\ns = sys.stdin.read().strip()\n\n# Your code here\nprint(s[::-1])',
        test_cases: [
            { id: 'sr-1', input: 'hello', expected_output: 'olleh', hidden: false },
            { id: 'sr-2', input: 'world', expected_output: 'dlrow', hidden: false },
            { id: 'sr-3', input: 'python', expected_output: 'nohtyp', hidden: true },
        ],
    },
    {
        id: 'two-sum',
        title: 'Two Sum',
        description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.',
        language: 'python',
        starter_code: 'def solution(nums, target):\n    # Write your code here\n    pass',
        test_cases: [
            { id: 'ts-1', input: '[2, 7, 11, 15], 9', expected_output: '[0, 1]', hidden: false },
            { id: 'ts-2', input: '[3, 2, 4], 6', expected_output: '[1, 2]', hidden: false },
            { id: 'ts-3', input: '[3, 3], 6', expected_output: '[0, 1]', hidden: true },
        ],
    },
];
