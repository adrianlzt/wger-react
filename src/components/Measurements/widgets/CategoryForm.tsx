import { Box, Button, Container, Stack, TextField, Typography } from "@mui/material";
import { MeasurementCategory } from "components/Measurements/models/Category";
import { useAddMeasurementCategoryQuery, useEditMeasurementCategoryQuery } from "components/Measurements/queries";
import { Form, Formik, useField } from "formik";
import React from 'react';
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import * as yup from 'yup';
import axios from 'axios';
import { makeHeader, makeUrl } from "utils/url";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/ext-language_tools";
import { setCompleters } from "ace-builds/src-noconflict/ext-language_tools";

export const API_MEASUREMENTS_TEST_CODE_PATH = 'measurement-test-code';

interface CategoryFormProps {
    category?: MeasurementCategory,
    closeFn?: Function,
}

// Editor for the code field with syntax highlighting
const AceField = ({ ...props }) => {
  const editorRef = useRef(null);

  // Completions https://codesandbox.io/p/sandbox/react-acesnippets-sk2uq?file=%2Fsrc%2FApp.js%3A62%2C7-63%2C38
  useEffect(() => {
    const completer = {
      getCompletions: function(editor, session, pos, prefix, callback) {
        var completions = [
          {
            caption: "meas_per_bw",
            snippet: `values = get_measurements_by_category_name("MEAS")
for v in values:
    weight = get_weight_by_date(v.date)
    print(f"{v.value}/{weight} = {v.value/weight}")
    results.append({
        "date": v.date,
        "value": v.value*100/weight,
    })`,
            type: "snippet"
          },
        ];

        /* You Can get to know how to add more cool
        autocomplete features by seeing the ext-language-tools
        file in the ace-buils folder */

        completions.forEach(i => {
          completions.push({
            caption: i.caption,
            snippet: i.snippet,
            type: i.type
          });
        });
        callback(null, completions);
      }
    };

    /* You can even use addCompleters instead of setCompleters like this :
       `addCompleter(completer)`;
     */

    setCompleters([completer]);
  }, []);

    const [field, , helpers] = useField(props);

    return (
        <AceEditor
            name={field.name}
            value={field.value}
            height="150px"
            onChange={value => helpers.setValue(value)}
            mode="python"
            theme="github"
            fontSize={14}
            showPrintMargin={false}
            enableSnippets={true}
            enableBasicAutocompletion={true}
            enableLiveAutocompletion={true}
            {...props}
        />
    );
};

export const CategoryForm = ({ category, closeFn }: CategoryFormProps) => {

    const [t] = useTranslation();
    const useAddCategoryQuery = useAddMeasurementCategoryQuery();
    const useEditCategoryQuery = useEditMeasurementCategoryQuery(category?.id!);
    const validationSchema = yup.object({
        name: yup
            .string()
            .required(t('forms.fieldRequired'))
            .max(20, t('forms.maxLength', { chars: '20' }))
            .min(3, t('forms.minLength', { chars: '3' })),
        unit: yup
            .string()
            .required(t('forms.fieldRequired'))
            .max(5, t('forms.maxLength', { chars: '5' })),
        description: yup
            .string()
            .nullable(),
        code: yup
            .string()
            .nullable(),

    });

    const [code, setCode] = React.useState("empty");

    // Send the code to the backend to test the code and get the results
    const handleTestCode = (code: string) => {
        // Use axios to make a post request to the backend
        axios.post(makeUrl(API_MEASUREMENTS_TEST_CODE_PATH), {
            code: code
            },
            { headers: makeHeader() },
            )
            .then(function (response) {
                console.log(response);
                setCode(response.data);
            }
            )
            .catch(function (error) {
                console.log(error);
                setCode(error.response.data);
            });
    };

    return (
        <Container>
            <Formik
                initialValues={{
                    name: category ? category.name : "",
                    unit: category ? category.unit : "",
                    description: category ? category.description : "",
                    code: category ? category.code : "",
                }}
                validationSchema={validationSchema}
                onSubmit={async (values) => {

                    // Edit existing weight entry
                    if (category) {
                        useEditCategoryQuery.mutate({ ...values, id: category.id });
                    } else {
                        useAddCategoryQuery.mutate(values);
                    }

                    // if closeFn is defined, close the modal (this form does not have to
                    // be displayed in a modal)
                    if (closeFn) {
                        closeFn();
                    }
                }}
            >
                {formik => (
                    <Form>
                        <Stack spacing={2}>
                            <TextField
                                fullWidth
                                id="name"
                                label={t('name')}
                                error={formik.touched.name && Boolean(formik.touched.name)}
                                helperText={formik.touched.name && formik.errors.name}
                                {...formik.getFieldProps('name')}
                            />
                            <TextField
                                fullWidth
                                id="unit"
                                label={t('unit')}
                                error={formik.touched.unit && Boolean(formik.errors.unit)}
                                helperText={
                                    Boolean(formik.touched.unit && formik.errors.unit)
                                        ? formik.errors.unit
                                        : t('measurements.unitFormHelpText')
                                }
                                {...formik.getFieldProps('unit')}
                            />
                            <TextField
                                fullWidth
                                multiline
                                id="description"
                                label={t('description')}
                                error={formik.touched.description && Boolean(formik.errors.description)}
                                helperText={
                                    Boolean(formik.touched.description && formik.errors.description)
                                        ? formik.errors.description
                                        : t('measurements.descriptionFormHelpText')
                                }
                                {...formik.getFieldProps('description')}
                            />
                            <AceField id="code" name="code" />
                            <Stack direction="row" justifyContent="end" sx={{ mt: 2 }}>

                                <Button color="primary" variant="contained" type="test" sx={{ mt: 2 }} onClick={e => {
                                    e.preventDefault();
                                    handleTestCode(formik.values.code);
                                }} >
                                    {t('testCode')}
                                </Button>
                                <Button color="primary" variant="contained" type="submit" sx={{ mt: 2 }}>
                                    {t('submit')}
                                </Button>
                            </Stack>
                        </Stack>
                    </Form>
                )}
            </Formik>
            <Box sx={{ mt: 2, visibility: code === "empty" ? "hidden" : "visible" }}>
                <Typography variant="h6" component="div" gutterBottom>
                    {t('codeResults')}
                </Typography>
                <pre>{JSON.stringify(code, null, 2)}</pre>
            </Box>
        </Container>
    );
};
