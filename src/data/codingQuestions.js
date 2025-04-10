export const codingQuestions = [
  {
    id: 1,
    title: 'Q1',
    difficulty: 'Easy',
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.
You may assume that each input would have exactly one solution, and you may not use the same element twice.
You can return the answer in any order.`,
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
      }
    ],
    starterCode: `function twoSum(nums, target) {
    // Write your code here
};`
  },
  {
    id: 2,
    title: 'Q2',
    difficulty: 'Easy',
    description: 'Given an integer x, return true if x is a palindrome, and false otherwise.',
    examples: [
      {
        input: 'x = 121',
        output: 'true',
        explanation: '121 reads as 121 from left to right and from right to left.'
      }
    ],
    starterCode: `function isPalindrome(x) {
    // Write your code here
};`
  },
  {
    id: 3,
    title: 'Q3',
    difficulty: 'Easy',
    description: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.
An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.`,
    examples: [
      {
        input: 's = "()"',
        output: 'true',
        explanation: 'The brackets are properly closed.'
      }
    ],
    starterCode: `function isValid(s) {
    // Write your code here
};`
  }
];