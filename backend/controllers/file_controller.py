from fastapi import HTTPException, Response, Request, Body


class File_controllers:
    @staticmethod
    async def share_files():
        try:
            i = 9

        except HTTPException:
            raise
        except Exception as e:
            print(e)
            raise HTTPException(status_code=500, detail="INTERNAL SERVER ERROR")
