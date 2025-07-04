def get_empty_puzzle_data():
    """
    Returns an empty puzzle data structure.
    """
    return {
        'grid': [
            ['A', 'B', 'C', 'D'],
            ['E', 'F', 'G', 'H'],
            ['I', 'J', 'K', 'L'],
            ['M', 'N', 'O', 'P'],
        ],
        'solutions': {
            'SOLUTION_1': ['A', 'B', 'C', 'D'],
            'SOLUTION_2': ['E', 'F', 'G', 'H'],
            'SOLUTION_3': ['I', 'J', 'K', 'L'],
            'SOLUTION_4': ['M', 'N', 'O', 'P'],
        },
    }

    return {
        'solutions': [
            {
                'name': 'SOLUTION_1',
                'difficulty': 0,
            },
            {
                'name': 'SOLUTION_2',
                'difficulty': 1,
            },
            {
                'name': 'SOLUTION_3',
                'difficulty': 2,
            },
            {
                'name': 'SOLUTION_4',
                'difficulty': 3,
            },
        ],
        'words': [
            {
                'word': 'A',
                'position': 0,
                'difficulty': 0,
            },
            {
                'word': 'B',
                'position': 1,
                'difficulty': 0,
            },
            {
                'word': 'C',
                'position': 2,
                'difficulty': 0,
            },
            {
                'word': 'D',
                'position': 3,
                'difficulty': 0,
            },
            {
                'word': 'E',
                'position': 4,
                'difficulty': 1,
            },
            {
                'word': 'F',
                'position': 5,
                'difficulty': 1,
            },
            {
                'word': 'G',
                'position': 6,
                'difficulty': 1,
            },
            {
                'word': 'H',
                'position': 7,
                'difficulty': 1,
            },
            {
                'word': 'I',
                'position': 8,
                'difficulty': 2,
            },
            {
                'word': 'J',
                'position': 9,
                'difficulty': 2,
            },
            {
                'word': 'K',
                'position': 10,
                'difficulty': 2,
            },
            {
                'word': 'L',
                'position': 11,
                'difficulty': 2,
            },
            {
                'word': 'M',
                'position': 12,
                'difficulty': 3,
            },
            {
                'word': 'N',
                'position': 13,
                'difficulty': 3,
            },
            {
                'word': 'O',
                'position': 14,
                'difficulty': 3,
            },
        ],
    }
