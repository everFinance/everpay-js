module.exports = {
  env: {
    browser: true,
    node: true,
    es2021: true
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint'],
  ignorePatterns: ['/dist'],
  rules: {
    indent: [
      'error',
      2
    ],
    'linebreak-style': [
      'error',
      'unix'
    ],
    quotes: [
      'error',
      'single'
    ],
    semi: [
      'error',
      'never'
    ],

    'for-direction': ['error'],
    'no-compare-neg-zero': ['error'],
    'no-cond-assign': ['error'],
    'no-constant-condition': ['error'],
    'no-control-regex': ['error'],
    'no-dupe-args': ['error'],
    'no-dupe-keys': ['error'],
    'no-duplicate-case': ['error'],
    'no-empty': [
      'error',
      {
        allowEmptyCatch: true
      }
    ],
    'no-empty-character-class': ['error'],
    'no-ex-assign': ['error'],
    'no-extra-boolean-cast': ['error'],
    'no-extra-semi': ['error'],
    'no-func-assign': ['error'],
    'no-inner-declarations': ['error'],
    'no-invalid-regexp': [
      'error',
      {
        allowConstructorFlags: ['u', 'y']
      }
    ],
    'no-irregular-whitespace': ['error'],
    'no-obj-calls': ['error'],
    'no-regex-spaces': ['error'],
    'no-sparse-arrays': ['error'],
    'no-template-curly-in-string': ['error'],
    'no-unexpected-multiline': ['error'],
    'no-unreachable': ['error'],
    'no-unsafe-finally': ['error'],
    'no-unsafe-negation': ['error'],
    'use-isnan': ['error'],
    'valid-typeof': [
      'error',
      {
        requireStringLiterals: true
      }
    ],
    'accessor-pairs': ['error'],
    'array-callback-return': [
      'error',
      {
        allowImplicit: true
      }
    ],
    'block-scoped-var': ['error'],
    complexity: [
      'warn',
      {
        max: 20
      }
    ],
    'consistent-return': ['error'],
    curly: ['error'],
    'default-case': ['error'],
    'dot-location': [
      'error',
      'property'
    ],
    'dot-notation': [
      'error',
      {
        allowKeywords: true
      }
    ],
    eqeqeq: ['error'],
    'no-alert': ['error'],
    'no-caller': ['error'],
    'no-case-declarations': ['error'],
    'no-else-return': ['error'],
    'no-empty-function': [
      'error',
      {
        allow: ['methods']
      }
    ],
    'no-empty-pattern': ['error'],
    'no-eq-null': ['error'],
    'no-eval': ['error'],
    'no-extend-native': ['error'],
    'no-extra-bind': ['error'],
    'no-extra-label': ['error'],
    'no-fallthrough': ['error'],
    'no-floating-decimal': ['error'],
    'no-global-assign': ['error'],
    'no-implicit-globals': ['error'],
    'no-implied-eval': ['error'],
    'no-invalid-this': ['error'],
    'no-iterator': ['error'],
    'no-labels': ['error'],
    'no-lone-blocks': ['error'],
    'no-loop-func': ['error'],
    'no-magic-numbers': ['off'],
    'no-multi-spaces': [
      'error',
      {
        exceptions: {
          ImportDeclaration: true,
          VariableDeclarator: true
        }
      }
    ],
    'no-multi-str': ['error'],
    'no-new': ['off'],
    'no-new-func': ['error'],
    'no-new-wrappers': ['error'],
    'no-octal': ['error'],
    'no-octal-escape': ['error'],
    'no-proto': ['error'],
    'no-redeclare': ['error'],
    'no-return-assign': ['error'],
    'no-return-await': ['error'],
    'no-script-url': ['error'],
    'no-self-assign': ['error'],
    'no-self-compare': ['error'],
    'no-sequences': ['error'],
    'no-throw-literal': ['error'],
    'no-unmodified-loop-condition': ['error'],
    'no-unused-expressions': [
      'error',
      {
        allowShortCircuit: true
      }
    ],
    'no-unused-labels': ['error'],
    'no-useless-call': ['error'],
    'no-useless-concat': ['error'],
    'no-useless-escape': ['error'],
    'no-void': ['error'],
    // 'no-warning-comments': ['warn'],
    'no-with': ['error'],
    'prefer-promise-reject-errors': [
      'error',
      {
        allowEmptyReject: true
      }
    ],
    'require-await': ['error'],
    'vars-on-top': ['error'],
    'wrap-iife': ['error'],
    yoda: [
      'error',
      'never'
    ],
    'no-catch-shadow': ['error'],
    'no-delete-var': ['error'],
    'no-label-var': ['error'],
    'no-shadow-restricted-names': ['error'],
    'no-undef': ['error'],
    'no-undef-init': ['error'],
    'no-unused-vars': [
      'error',
      {
        args: 'none'
      }
    ],
    'no-use-before-define': ['error'],
    'global-require': ['error'],
    'handle-callback-err': ['error'],
    'no-buffer-constructor': ['error'],
    'no-mixed-requires': ['error'],
    'no-new-require': ['error'],
    'no-path-concat': ['error'],
    'no-process-exit': ['error'],
    'array-bracket-newline': ['error'],
    'array-bracket-spacing': [
      'error',
      'never'
    ],
    'block-spacing': [
      'error',
      'never'
    ],
    'brace-style': [
      'error',
      '1tbs'
    ],
    camelcase: [
      'error',
      {
        properties: 'never'
      }
    ],
    'comma-spacing': [
      'error',
      {
        before: false,
        after: true
      }
    ],
    'comma-style': [
      'error',
      'last'
    ],
    'computed-property-spacing': [
      'error',
      'never'
    ],
    'eol-last': ['error'],
    'func-call-spacing': [
      'error',
      'never'
    ],
    'func-names': [
      'error',
      'never'
    ],
    'func-style': [
      'error',
      'expression',
      {
        allowArrowFunctions: true
      }
    ],
    'id-length': [
      'error',
      {
        min: 2,
        max: 60,
        exceptions: ['e', 'g', 'i', 'j', 'v', 'k', 't', 'h', '$', '_'],
        properties: 'never'
      }
    ],
    'key-spacing': [
      'error',
      {
        beforeColon: false,
        afterColon: true
      }
    ],
    'keyword-spacing': [
      'error',
      {
        before: true,
        after: true
      }
    ],
    'max-depth': [
      'error',
      6
    ],
    // "max-len": [
    //     "error",
    //     {
    //         "code": 120,
    //         "ignoreStrings": true,
    //         "ignoreUrls": true,
    //         "ignoreTemplateLiterals": true
    //     }
    // ],
    'max-nested-callbacks': [
      'error',
      {
        max: 6
      }
    ],
    'max-params': [
      'error',
      {
        max: 5
      }
    ],
    'max-statements': [
      'error',
      1000,
      {
        ignoreTopLevelFunctions: true
      }
    ],
    'max-statements-per-line': ['error'],
    'new-cap': ['error'],
    'new-parens': ['error'],
    'newline-per-chained-call': ['error'],
    'no-array-constructor': ['error'],
    'no-continue': ['error'],
    'no-lonely-if': ['error'],
    'no-mixed-operators': ['error'],
    'no-mixed-spaces-and-tabs': ['error'],
    'no-multi-assign': ['error'],
    'no-multiple-empty-lines': [
      'error',
      {
        max: 1
      }
    ],
    'no-nested-ternary': ['error'],
    'no-new-object': ['error'],
    'no-plusplus': [
      'error',
      {
        allowForLoopAfterthoughts: true
      }
    ],
    'no-tabs': ['error'],
    'no-trailing-spaces': ['error'],
    'no-unneeded-ternary': ['error'],
    'no-whitespace-before-property': ['error'],
    'nonblock-statement-body-position': ['error'],
    'object-curly-newline': [
      'error',
      {
        ObjectExpression: {
          multiline: true,
          minProperties: 1
        },
        ObjectPattern: {
          multiline: true,
          minProperties: 3
        }
      }
    ],
    'object-curly-spacing': 1,
    'one-var': [
      'error',
      'never'
    ],
    'operator-linebreak': [
      'error',
      'after'
    ],
    'padded-blocks': [
      'error',
      'never'
    ],
    'padding-line-between-statements': ['error'],
    'quote-props': [
      'error',
      'as-needed'
    ],
    'semi-spacing': [
      'error',
      {
        before: false,
        after: true
      }
    ],
    'space-before-blocks': [
      'error',
      'always'
    ],
    'space-before-function-paren': [
      'error',
      {
        anonymous: 'always',
        named: 'never',
        asyncArrow: 'always'
      }
    ],
    'space-in-parens': [
      'error',
      'never'
    ],
    'space-infix-ops': ['error'],
    'space-unary-ops': [
      'error',
      {
        words: true,
        nonwords: false
      }
    ],
    'spaced-comment': [
      'error',
      'always'
    ],
    'unicode-bom': ['error'],
    'arrow-body-style': [
      'error',
      'as-needed'
    ],
    'arrow-spacing': [
      'error',
      {
        before: true,
        after: true
      }
    ],
    'constructor-super': ['error'],
    'no-class-assign': ['error'],
    'no-confusing-arrow': [
      'error',
      {
        allowParens: true
      }
    ],
    'no-const-assign': ['error'],
    'no-dupe-class-members': ['error'],
    'no-duplicate-imports': ['error'],
    'no-new-symbol': ['error'],
    'no-this-before-super': ['error'],
    'no-useless-computed-key': ['error'],
    'no-useless-rename': ['error'],
    'no-var': ['error'],
    'object-shorthand': ['error'],
    'prefer-arrow-callback': ['error'],
    'prefer-rest-params': ['error'],
    'prefer-spread': ['error'],
    'prefer-template': ['error'],
    'rest-spread-spacing': [
      'error',
      'never'
    ],
    'symbol-description': ['error'],
    'template-curly-spacing': [
      'error',
      'never'
    ],
    // "promise/catch-or-return": [
    //     "warn"
    // ],
  }
}
