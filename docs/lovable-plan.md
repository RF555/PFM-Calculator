Plan: Separate material and grade selection

Current state:
- Material selector is a single grouped dropdown where users pick both material and grade in one step.

Requested change:
- Revert to a two-step selector: first choose the base material (e.g., Titanium), then choose the grade (e.g., Gr.2) in a second dropdown.

Steps:
1. Update `src/components/MaterialSelector.tsx` to render two dropdowns:
   - Material dropdown: lists main materials only.
   - Grade dropdown: appears only after a material is selected and lists that material's subtypes/grades. For materials without subtypes, show a single "Standard" option.
2. Update `src/data/materials.json` to add common Titanium grades (e.g., Gr.2, Gr.5, Gr.7) so the Titanium → Gr.2 example works.
3. Verify the `Calculator.tsx` state wiring still works correctly with the split selectors.

No UI theme, state shape, or calculation changes beyond the selector refactor.