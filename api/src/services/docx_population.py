from io import BytesIO
from docxtpl import DocxTemplate


class DocxPopulationService:
    def render(self, template_bytes: bytes, context: dict) -> bytes:
        template_stream = BytesIO(template_bytes)
        doc = DocxTemplate(template_stream)
        doc.render(context)
        output_stream = BytesIO()
        doc.save(output_stream)
        return output_stream.getvalue()
