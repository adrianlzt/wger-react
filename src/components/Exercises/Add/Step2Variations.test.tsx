import React from "react";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { testExerciseBenchPress, testExerciseCrunches, testExerciseCurls } from "tests/exerciseTestdata";
import { useBasesQuery } from "components/Exercises/queries";
import { Step2Variations } from "components/Exercises/Add/Step2Variations";
import userEvent from "@testing-library/user-event";
import { ExerciseStateProvider } from "state";

jest.mock('components/Exercises/queries');


const mockedUseBasesQuery = useBasesQuery as jest.Mock;


const mockOnContinue = jest.fn();
const queryClient = new QueryClient();

describe("Test the add exercise step 2 component", () => {

    beforeEach(() => {
        mockedUseBasesQuery.mockImplementation(() => ({
            isLoading: false,
            isSuccess: true,
            data: [
                testExerciseBenchPress,
                testExerciseCurls,
                testExerciseCrunches
            ]
        }));

    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("Renders without crashing", () => {
        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <Step2Variations onContinue={mockOnContinue} />
            </QueryClientProvider>
        );

        // Assert
        expect(screen.getByText("exercises.whatVariationsExist")).toBeInTheDocument();
        expect(screen.getByText("exercises.filterVariations")).toBeInTheDocument();
        expect(screen.getByText("exercises.identicalExercisePleaseDiscard")).toBeInTheDocument();
        expect(screen.getByText("Benchpress")).toBeInTheDocument();
        expect(screen.getByText("Curls")).toBeInTheDocument();
        expect(screen.getByText("Crunches")).toBeInTheDocument();
    });

    test("Correctly sets the variation ID", async () => {
        // Act
        render(
            <ExerciseStateProvider>
                <QueryClientProvider client={queryClient}>
                    <Step2Variations onContinue={mockOnContinue} />
                </QueryClientProvider>
            </ExerciseStateProvider>
        );
        const benchPress = screen.getByText("Benchpress");
        await userEvent.click(benchPress);

        // Assert
        //...
    });

    test("Correctly unsets the variation ID", async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <Step2Variations onContinue={mockOnContinue} />
            </QueryClientProvider>
        );
        const benchpress = screen.getByText("Benchpress");
        await user.click(benchpress);
        await user.click(benchpress);

        // Assert
    });

    test("Correctly sets the newVariationBaseId ID", async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <Step2Variations onContinue={mockOnContinue} />
            </QueryClientProvider>
        );
        const crunches = screen.getByText("Crunches");
        await user.click(crunches);

        // Assert
    });
    test("Correctly unsets the newVariationBaseId ID", async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <Step2Variations onContinue={mockOnContinue} />
            </QueryClientProvider>
        );
        const crunches = screen.getByText("Crunches");
        await user.click(crunches);
        await user.click(crunches);

        // Assert
    });

    test("can correctly filter the exercises", async () => {
        // Arrange
        const user = userEvent.setup();

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <Step2Variations onContinue={mockOnContinue} />
            </QueryClientProvider>
        );
        const input = screen.getByLabelText('exercises.filterVariations');

        // Assert
        expect(screen.getByText("Benchpress")).toBeInTheDocument();
        expect(screen.getByText("Curls")).toBeInTheDocument();
        expect(screen.getByText("Crunches")).toBeInTheDocument();

        await user.type(input, 'cru');
        expect(screen.queryByText("Benchpress")).not.toBeInTheDocument();
        expect(screen.queryByText("Curls")).not.toBeInTheDocument();
        expect(screen.getByText("Crunches")).toBeInTheDocument();

        await user.clear(input);
        await user.type(input, 'Bench');
        expect(screen.getByText("Benchpress")).toBeInTheDocument();
        expect(screen.queryByText("Curls")).not.toBeInTheDocument();
        expect(screen.queryByText("Crunches")).not.toBeInTheDocument();
    });
});
